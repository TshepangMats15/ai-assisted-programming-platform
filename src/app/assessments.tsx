// DevMate Student Course Screen

import React, { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  ActivityIndicator,
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

export default function AssessmentsScreen() {
  const { colors, isDark } = useAppTheme();

  const params = useLocalSearchParams<{
    courseID?: string;
    courseworkId?: string;
  }>();

  /*
   * Support both names temporarily because the existing Coursework
   * screen previously used "courseworkId", while the Learn screen
   * is being changed to use "courseID".
   */
  const courseID =
    typeof params.courseID === "string"
      ? params.courseID
      : typeof params.courseworkId === "string"
        ? params.courseworkId
        : "";

  const purple = "#8B5CF6";
  const purpleText = isDark ? "#A78BFA" : "#6D28D9";

  const [course, setCourse] = useState<CourseworkDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =======================================================
  // LOAD SELECTED COURSE
  // =======================================================

  const loadCourse = useCallback(async () => {
    try {
      setError(null);

      if (!courseID) {
        throw new Error(
          "No course was selected. Please return to Learn and select a course."
        );
      }

      const user = auth.currentUser;

      if (!user) {
        throw new Error(
          "You must be signed in to access this course."
        );
      }

      /*
       * Firebase ID token -> Authorization header.
       * Firebase UID -> backend coursework gating.
       */
      const token = await user.getIdToken();

      setAuthToken(token);

      const data = await api.coursework.getById(
        courseID,
        user.uid
      );

      setCourse(data);
    } catch (err: any) {
      console.error("[Course] Failed to load course:", err);

      setCourse(null);

      setError(
        err?.message ||
          "Unable to load this course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [courseID]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadCourse();
    } finally {
      setRefreshing(false);
    }
  }, [loadCourse]);

  // =======================================================
  // RETRY
  // =======================================================

  const handleRetry = async () => {
    setLoading(true);
    await loadCourse();
  };

  // =======================================================
  // ASSESSMENT NAVIGATION
  // =======================================================

  const openAssessment = (
    assessment: AssessmentDTO
  ) => {
    if (assessment.assessmentID == null) {
      return;
    }

    router.push({
      pathname: "/assessment-details",
      params: {
        assessmentId: String(assessment.assessmentID),
        assessmentTitle: assessment.title,
        language: assessment.programLang || "",
        courseID,
      },
    });
  };

  // =======================================================
  // LESSON NAVIGATION
  // =======================================================

  const openLesson = (lesson: LessonDTO) => {
    /*
     * We have not created/confirmed the lesson-detail route yet.
     *
     * Do not navigate to a fake route. For now, lessons are shown
     * using their real backend data. The next step will connect
     * these cards to the lesson viewer.
     */
    console.log(
      `[Course] Selected lesson ${lesson.lessonID}`
    );
  };

  // =======================================================
  // GATING
  // =======================================================

  /*
   * Your backend's gated coursework endpoint clears lessons and
   * removes postAssessment when the student has not completed the
   * pre-assessment.
   */
  const hasPreAssessment = Boolean(course?.preAssessment);

  const lessons = course?.lessons ?? [];

  const hasPostAssessment = Boolean(
    course?.postAssessment
  );

  const contentUnlocked =
    !hasPreAssessment ||
    lessons.length > 0 ||
    hasPostAssessment;

  // =======================================================
  // LOADING SCREEN
  // =======================================================

  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.centerState}>
          <ActivityIndicator
            size="large"
            color={purple}
          />

          <Text
            style={[
              styles.stateTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Loading course
          </Text>

          <Text
            style={[
              styles.stateDescription,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Checking your course access and learning content.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =======================================================
  // ERROR SCREEN
  // =======================================================

  if (error || !course) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.errorHeader}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: colors.backgroundElement,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.centerState}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={purple}
          />

          <Text
            style={[
              styles.stateTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Unable to load course
          </Text>

          <Text
            style={[
              styles.stateDescription,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {error || "Course information is unavailable."}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.retryButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // =======================================================
  // COURSE
  // =======================================================

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={purple}
            colors={[purple]}
          />
        }
      >
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: colors.backgroundElement,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                },
              ]}
            >
              {course.title}
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {course.module || course.courseID}
            </Text>
          </View>
        </View>

        {/* ================= COURSE INFORMATION ================= */}

        <View
          style={[
            styles.courseInfoCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.courseInfoTop}>
            <View
              style={[
                styles.courseIcon,
                {
                  backgroundColor: isDark
                    ? "#2D2140"
                    : "#EDE9FE",
                },
              ]}
            >
              <Ionicons
                name="book-outline"
                size={24}
                color={purple}
              />
            </View>

            <View style={styles.courseInfoText}>
              <Text
                style={[
                  styles.courseLabel,
                  {
                    color: purpleText,
                  },
                ]}
              >
                COURSE
              </Text>

              <Text
                style={[
                  styles.courseID,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {course.courseID}
              </Text>
            </View>
          </View>

          {course.description ? (
            <Text
              style={[
                styles.courseDescription,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {course.description}
            </Text>
          ) : null}
        </View>

        {/* ================= PRE-ASSESSMENT ================= */}

        {course.preAssessment ? (
          <>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Pre-Assessment
            </Text>

            <TouchableOpacity
              style={[
                styles.assessmentCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.8}
              onPress={() =>
                openAssessment(course.preAssessment!)
              }
            >
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.numberBox,
                    {
                      backgroundColor: isDark
                        ? "#2D2140"
                        : "#EDE9FE",
                    },
                  ]}
                >
                  <Ionicons
                    name="clipboard-outline"
                    size={21}
                    color={purple}
                  />
                </View>

                <View style={styles.assessmentInfo}>
                  <Text
                    style={[
                      styles.assessmentTitle,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {course.preAssessment.title}
                  </Text>

                  <Text
                    style={[
                      styles.assessmentType,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    Pre-Assessment
                  </Text>
                </View>

                <View
                  style={[
                    styles.activeBadge,
                    {
                      backgroundColor: isDark
                        ? "#2D2140"
                        : "#EDE9FE",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.activeText,
                      {
                        color: purpleText,
                      },
                    ]}
                  >
                    START
                  </Text>
                </View>
              </View>

              {course.preAssessment.description ? (
                <Text
                  style={[
                    styles.description,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {course.preAssessment.description}
                </Text>
              ) : null}

              <View
                style={[
                  styles.cardFooter,
                  {
                    borderTopColor: colors.border,
                  },
                ]}
              >
                <Text style={styles.continueText}>
                  Open Pre-Assessment
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={purple}
                />
              </View>
            </TouchableOpacity>
          </>
        ) : null}

        {/* ================= LOCKED CONTENT ================= */}

        {hasPreAssessment && !contentUnlocked ? (
          <>
            <Text
              style={[
                styles.sectionTitle,
                styles.sectionSpacing,
                {
                  color: colors.text,
                },
              ]}
            >
              Lessons
            </Text>

            <View
              style={[
                styles.lockedCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.lockIcon,
                  {
                    backgroundColor: isDark
                      ? "#292929"
                      : "#F3F4F6",
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color={colors.textSecondary}
                />
              </View>

              <Text
                style={[
                  styles.lockedTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Course content locked
              </Text>

              <Text
                style={[
                  styles.lockMessage,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                Complete the pre-assessment to unlock the
                course lessons and post-assessment.
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* ================= LESSONS ================= */}

            <Text
              style={[
                styles.sectionTitle,
                styles.sectionSpacing,
                {
                  color: colors.text,
                },
              ]}
            >
              Lessons
            </Text>

            {lessons.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="book-outline"
                  size={34}
                  color={purple}
                />

                <Text
                  style={[
                    styles.emptyTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  No lessons available
                </Text>

                <Text
                  style={[
                    styles.emptyDescription,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  No lessons have been added to this course yet.
                </Text>
              </View>
            ) : (
              lessons.map((lesson, index) => (
                <TouchableOpacity
                  key={lesson.lessonID}
                  style={[
                    styles.lessonCard,
                    {
                      backgroundColor:
                        colors.backgroundElement,
                      borderColor: colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => openLesson(lesson)}
                >
                  <View
                    style={[
                      styles.lessonNumber,
                      {
                        backgroundColor: isDark
                          ? "#2D2140"
                          : "#EDE9FE",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.lessonNumberText,
                        {
                          color: purpleText,
                        },
                      ]}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </Text>
                  </View>

                  <View style={styles.lessonInfo}>
                    <Text
                      style={[
                        styles.lessonTitle,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      {lesson.title}
                    </Text>

                    <View style={styles.lessonTypeRow}>
                      <Ionicons
                        name={
                          lesson.contentType === "VIDEO"
                            ? "play-circle-outline"
                            : lesson.contentType === "CODE_LAB"
                              ? "code-slash-outline"
                              : "document-text-outline"
                        }
                        size={14}
                        color={colors.textSecondary}
                      />

                      <Text
                        style={[
                          styles.lessonType,
                          {
                            color: colors.textSecondary,
                          },
                        ]}
                      >
                        {lesson.contentType
                          .replace(/_/g, " ")
                          .toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={purple}
                  />
                </TouchableOpacity>
              ))
            )}

            {/* ================= POST-ASSESSMENT ================= */}

            {course.postAssessment ? (
              <>
                <Text
                  style={[
                    styles.sectionTitle,
                    styles.sectionSpacing,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Post-Assessment
                </Text>

                <TouchableOpacity
                  style={[
                    styles.assessmentCard,
                    {
                      backgroundColor:
                        colors.backgroundElement,
                      borderColor: colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    openAssessment(course.postAssessment!)
                  }
                >
                  <View style={styles.cardTop}>
                    <View
                      style={[
                        styles.numberBox,
                        {
                          backgroundColor: isDark
                            ? "#2D2140"
                            : "#EDE9FE",
                        },
                      ]}
                    >
                      <Ionicons
                        name="school-outline"
                        size={21}
                        color={purple}
                      />
                    </View>

                    <View style={styles.assessmentInfo}>
                      <Text
                        style={[
                          styles.assessmentTitle,
                          {
                            color: colors.text,
                          },
                        ]}
                      >
                        {course.postAssessment.title}
                      </Text>

                      <Text
                        style={[
                          styles.assessmentType,
                          {
                            color: colors.textSecondary,
                          },
                        ]}
                      >
                        Post-Assessment
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.activeBadge,
                        {
                          backgroundColor: isDark
                            ? "#2D2140"
                            : "#EDE9FE",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.activeText,
                          {
                            color: purpleText,
                          },
                        ]}
                      >
                        START
                      </Text>
                    </View>
                  </View>

                  {course.postAssessment.description ? (
                    <Text
                      style={[
                        styles.description,
                        {
                          color: colors.textSecondary,
                        },
                      ]}
                    >
                      {course.postAssessment.description}
                    </Text>
                  ) : null}

                  <View
                    style={[
                      styles.cardFooter,
                      {
                        borderTopColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={styles.continueText}>
                      Open Post-Assessment
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={19}
                      color={purple}
                    />
                  </View>
                </TouchableOpacity>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  // HEADER

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 25,
  },

  headerContent: {
    flex: 1,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 13,
    marginTop: 3,
  },

  errorHeader: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  // COURSE INFORMATION

  courseInfoCard: {
    borderWidth: 1,
    padding: 18,
    borderRadius: 12,
    marginBottom: 28,
  },

  courseInfoTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  courseIcon: {
    width: 46,
    height: 46,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  courseInfoText: {
    flex: 1,
  },

  courseLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
  },

  courseID: {
    fontSize: 15,
    fontWeight: "bold",
  },

  courseDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },

  // SECTIONS

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  sectionSpacing: {
    marginTop: 14,
  },

  // ASSESSMENTS

  assessmentCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  numberBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  assessmentInfo: {
    flex: 1,
  },

  assessmentTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },

  assessmentType: {
    fontSize: 11,
    marginTop: 4,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },

  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  activeText: {
    fontSize: 9,
    fontWeight: "bold",
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
  },

  continueText: {
    color: "#8B5CF6",
    fontSize: 12,
    fontWeight: "bold",
  },

  // LESSONS

  lessonCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  lessonNumber: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  lessonNumberText: {
    fontSize: 12,
    fontWeight: "bold",
  },

  lessonInfo: {
    flex: 1,
  },

  lessonTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },

  lessonTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },

  lessonType: {
    fontSize: 10,
    fontWeight: "600",
  },

  // LOCKED

  lockedCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },

  lockIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },

  lockedTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 13,
  },

  lockMessage: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    textAlign: "center",
  },

  // EMPTY

  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 11,
  },

  emptyDescription: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
  },

  // STATES

  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  stateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },

  stateDescription: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  retryButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});