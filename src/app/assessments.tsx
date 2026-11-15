
import React, { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "../services/firebase";
import api, {
  AssessmentDTO,
  CourseworkDTO,
  LessonDTO,
  setAuthToken,
} from "../constants/api";
import { useAppTheme } from "../context/ThemeContext";

const PURPLE = "#8B5CF6";

function extractLinks(content: string): string[] {
  const matches = content.match(/https?:\/\/[^\s<>"']+/gi) ?? [];

  return [...new Set(
    matches.map((url) => url.replace(/[),.;!?]+$/, ""))
  )];
}

function removeLinks(content: string): string {
  return content
    .replace(/https?:\/\/[^\s<>"']+/gi, "")
    .trim();
}

export default function AssessmentsScreen() {
  const { colors, isDark } = useAppTheme();

  const params = useLocalSearchParams<{
    courseID?: string;
    courseworkId?: string;
  }>();

  const courseID =
    typeof params.courseID === "string"
      ? params.courseID
      : typeof params.courseworkId === "string"
        ? params.courseworkId
        : "";

  const [course, setCourse] = useState<CourseworkDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] =
    useState<LessonDTO | null>(null);

  const [openedLessonIds, setOpenedLessonIds] =
    useState<string[]>([]);

  const loadCourse = useCallback(async () => {
    try {
      setError(null);

      if (!courseID.trim()) {
        throw new Error("No course was selected.");
      }

      const user = auth.currentUser;

      if (!user) {
        throw new Error(
          "Please sign in to access your coursework."
        );
      }

      const token = await user.getIdToken();
      setAuthToken(token);

      
      const [courseData, lessonData] = await Promise.all([
        api.coursework.getById(courseID),
        api.lessons.getByCourse(courseID),
      ]);

      setCourse({
        ...courseData,
        lessons: Array.isArray(lessonData) ? lessonData : [],
      });


    } catch (err: any) {
      setCourse(null);
      setError(
        err?.message || "Unable to load this course."
      );
    } finally {
      setLoading(false);
    }
  }, [courseID]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadCourse();
    } finally {
      setRefreshing(false);
    }
  }, [loadCourse]);

  const openLesson = (lesson: LessonDTO) => {
    setSelectedLesson(lesson);

    setOpenedLessonIds((previous) =>
      previous.includes(lesson.lessonID)
        ? previous
        : [...previous, lesson.lessonID]
    );
  };

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert(
          "Cannot Open Link",
          "This resource URL is not supported."
        );
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Link Error",
        "Unable to open this learning resource."
      );
    }
  };

  const openAssessment = (
    assessment: AssessmentDTO | null | undefined
  ) => {
    if (!assessment?.assessmentID) {
      Alert.alert(
        "Assessment Unavailable",
        "This assessment has not been configured."
      );
      return;
    }

    router.push({
      pathname: "/assessment-details",
      params: {
        assessmentId: String(assessment.assessmentID),
        courseID,
        language: assessment.programLang || "",
      },
    });
  };

  const lessons = course?.lessons ?? [];
  const independentAssessment = course?.preAssessment;
  const assistedAssessment = course?.postAssessment;

  // These values represent lesson openings in the current
  // screen session only, not persisted completion records.
  const lessonsOpened = lessons.filter((lesson) =>
    openedLessonIds.includes(lesson.lessonID)
  ).length;

  const textColor = colors.text;
  const secondary = colors.textSecondary;
  const cardColor = colors.backgroundElement;
  const borderColor = colors.border;

  const lessonContent = selectedLesson
    ? String(selectedLesson.contentBody ?? "")
    : "";

  const lessonLinks = extractLinks(lessonContent);
  const lessonText = removeLinks(lessonContent);

  const renderAssessment = (
    assessment: AssessmentDTO | null | undefined,
    title: string,
    description: string,
    expectedAI: boolean
  ) => {
    const configuredCorrectly =
      assessment?.aiAllowed === expectedAI;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: cardColor,
            borderColor,
          },
        ]}
      >
        <View style={styles.row}>
          <Ionicons
            name={
              expectedAI
                ? "sparkles-outline"
                : "shield-checkmark-outline"
            }
            size={24}
            color={PURPLE}
          />

          <Text style={[styles.cardTitle, { color: textColor }]}>
            {title}
          </Text>
        </View>

        <Text style={[styles.body, { color: secondary }]}>
          {description}
        </Text>

        {assessment ? (
          <>
            <Text
              style={[
                styles.assessmentName,
                { color: textColor },
              ]}
            >
              {assessment.title}
            </Text>

            <Text style={[styles.meta, { color: secondary }]}>
              AI assistance:{" "}
              {assessment.aiAllowed ? "Allowed" : "Disabled"}
            </Text>

            {!configuredCorrectly && (
              <Text style={styles.warning}>
                This assessment's AI permission does not
                match the required learning sequence.
                An administrator must correct it.
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                !configuredCorrectly && styles.disabled,
              ]}
              disabled={!configuredCorrectly}
              onPress={() => openAssessment(assessment)}
            >
              <Text style={styles.primaryText}>
                Open Assessment
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[styles.meta, { color: secondary }]}>
            No assessment has been assigned to this stage.
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={PURPLE}
          />
        }
      >
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={PURPLE}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color={PURPLE}
            />
            <Text style={[styles.body, { color: secondary }]}>
              Loading course...
            </Text>
          </View>
        ) : error || !course ? (
          <View
            style={[
              styles.card,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Unable to load course
            </Text>

            <Text style={[styles.body, { color: secondary }]}>
              {error || "Course unavailable."}
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setLoading(true);
                loadCourse();
              }}
            >
              <Text style={styles.primaryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[styles.heading, { color: textColor }]}>
              {course.title}
            </Text>

            <Text style={[styles.subtitle, { color: secondary }]}>
              {course.module || course.courseID}
            </Text>

            {course.description ? (
              <Text style={[styles.body, { color: secondary }]}>
                {course.description}
              </Text>
            ) : null}

            <View
              style={[
                styles.progressCard,
                { backgroundColor: cardColor },
              ]}
            >
              <Text
                style={[styles.cardTitle, { color: textColor }]}
              >
                Your Learning Journey
              </Text>

              <Text style={[styles.body, { color: secondary }]}>
                1. Study the mini-lessons
                {"\n"}2. Complete the independent assessment
                {"\n"}3. Complete the AI-assisted assessment
              </Text>

              <Text style={styles.progressText}>
                {lessonsOpened} of {lessons.length} lessons opened
                this session
              </Text>
            </View>

            <Text style={[styles.section, { color: textColor }]}>
              Step 1 · Mini-Lessons
            </Text>

            <Text style={[styles.body, { color: secondary }]}>
              Study the topic explanations and open the
              recommended learning resources.
            </Text>

            {lessons.length === 0 ? (
              <View
                style={[
                  styles.card,
                  { backgroundColor: cardColor, borderColor },
                ]}
              >
                <Text
                  style={[styles.cardTitle, { color: textColor }]}
                >
                  No lessons available
                </Text>

                <Text style={[styles.body, { color: secondary }]}>
                  The course API has not returned any lessons.
                  They may not be configured, or the backend
                  may still be hiding them behind the old
                  pre-assessment requirement.
                </Text>
              </View>
            ) : (
              lessons.map((lesson, index) => (
                <TouchableOpacity
                  key={lesson.lessonID}
                  style={[
                    styles.card,
                    {
                      backgroundColor: cardColor,
                      borderColor,
                    },
                  ]}
                  onPress={() => openLesson(lesson)}
                >
                  <View style={styles.row}>
                    <View style={styles.numberCircle}>
                      <Text style={styles.numberText}>
                        {index + 1}
                      </Text>
                    </View>

                    <View style={styles.flex}>
                      <Text
                        style={[
                          styles.cardTitle,
                          { color: textColor },
                        ]}
                      >
                        {lesson.title}
                      </Text>

                      <Text
                        style={[styles.meta, { color: secondary }]}
                      >
                        {String(lesson.contentType || "LESSON")
                          .replace(/_/g, " ")}
                      </Text>
                    </View>

                    <Ionicons
                      name={
                        openedLessonIds.includes(lesson.lessonID)
                          ? "checkmark-circle-outline"
                          : "chevron-forward"
                      }
                      size={22}
                      color={PURPLE}
                    />
                  </View>
                </TouchableOpacity>
              ))
            )}

            <Text style={[styles.section, { color: textColor }]}>
              Step 2 · Independent Assessment
            </Text>

            {renderAssessment(
              independentAssessment,
              "Work Without AI",
              "Complete the programming assessment using your own knowledge. AI assistance must be disabled.",
              false
            )}

            <Text style={[styles.section, { color: textColor }]}>
              Step 3 · AI-Assisted Assessment
            </Text>

            {renderAssessment(
              assistedAssessment,
              "Work With AI",
              "Complete the next assessment with AI assistance available. Your performance and AI usage can then be compared with the independent assessment.",
              true
            )}

            <View
              style={[
                styles.card,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <View style={styles.row}>
                <Ionicons
                  name="analytics-outline"
                  size={24}
                  color={PURPLE}
                />
                <Text
                  style={[styles.cardTitle, { color: textColor }]}
                >
                  Performance Tracking
                </Text>
              </View>

              <Text style={[styles.body, { color: secondary }]}>
                Assessment scores, duration, code attempts
                and AI interactions will form the basis of
                the telemetry comparison.

                {"\n\n"}This screen does not yet save
                lesson-opening or resource-opening events
                to the backend.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={selectedLesson !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedLesson(null)}
      >
        <SafeAreaView
          style={[
            styles.container,
            { backgroundColor: colors.background },
          ]}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <TouchableOpacity
              style={styles.back}
              onPress={() => setSelectedLesson(null)}
            >
              <Ionicons
                name="close"
                size={24}
                color={PURPLE}
              />
              <Text style={styles.backText}>Close Lesson</Text>
            </TouchableOpacity>

            <Text style={[styles.heading, { color: textColor }]}>
              {selectedLesson?.title}
            </Text>

            <Text style={[styles.subtitle, { color: secondary }]}>
              {String(
                selectedLesson?.contentType || "LESSON"
              ).replace(/_/g, " ")}
            </Text>

            <View
              style={[
                styles.card,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text
                style={[styles.cardTitle, { color: textColor }]}
              >
                Lesson Content
              </Text>

              <Text style={[styles.lessonBody, { color: textColor }]}>
                {lessonText ||
                  (lessonLinks.length > 0
                    ? "Open the learning resources below."
                    : "No lesson content has been added yet.")}
              </Text>
            </View>

            {lessonLinks.length > 0 && (
              <>
                <Text
                  style={[styles.section, { color: textColor }]}
                >
                  Learning Resources
                </Text>

                {lessonLinks.map((url, index) => (
                  <TouchableOpacity
                    key={`${url}-${index}`}
                    style={[
                      styles.card,
                      {
                        backgroundColor: cardColor,
                        borderColor,
                      },
                    ]}
                    onPress={() => openLink(url)}
                  >
                    <View style={styles.row}>
                      <Ionicons
                        name="link-outline"
                        size={22}
                        color={PURPLE}
                      />

                      <Text
                        style={[
                          styles.linkText,
                          { color: PURPLE },
                        ]}
                        numberOfLines={3}
                      >
                        {url}
                      </Text>

                      <Ionicons
                        name="open-outline"
                        size={18}
                        color={PURPLE}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setSelectedLesson(null)}
            >
              <Text style={styles.primaryText}>
                Return to Course
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 4,
  },
  backText: {
    color: PURPLE,
    fontSize: 16,
    fontWeight: "600",
  },
  heading: {
    fontSize: 27,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 18,
  },
  body: {
    fontSize: 14,
    lineHeight: 23,
    marginTop: 10,
  },
  section: {
    fontSize: 19,
    fontWeight: "700",
    marginTop: 28,
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
  },
  progressCard: {
    borderRadius: 14,
    padding: 18,
    marginTop: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  numberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    color: PURPLE,
    fontWeight: "700",
  },
  meta: {
    fontSize: 13,
    marginTop: 8,
  },
  assessmentName: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  warning: {
    color: "#F59E0B",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: PURPLE,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 18,
  },
  disabled: {
    opacity: 0.4,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  progressText: {
    color: PURPLE,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 14,
  },
  lessonBody: {
    fontSize: 15,
    lineHeight: 25,
    marginTop: 14,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  center: {
    paddingVertical: 70,
    alignItems: "center",
    gap: 16,
  },
});
