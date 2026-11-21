
import React, { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import api, {
  CourseworkDTO,
  LessonDTO,
} from "../../constants/api";

const C = {
  background: "#0D0D0D",
  card: "#1A1A1A",
  input: "#242424",
  purple: "#8B5CF6",
  lightPurple: "#A78BFA",
  white: "#FFFFFF",
  secondary: "#A3A3A3",
  border: "#292929",
  danger: "#EF4444",
  green: "#22C55E",
};

type LessonType = "READING" | "VIDEO" | "CODE_LAB";

const lessonTypes: LessonType[] = [
  "READING",
  "VIDEO",
  "CODE_LAB",
];

function getError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

function validDate(value: string): boolean {
  if (!value) return true;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function displayDate(value?: string | null): string {
  if (!value) return "Not set";
  return value.slice(0, 10);
}

function normaliseLinks(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((link) => link.trim())
    .filter(Boolean);
}

function splitLessonContent(content: string): {
  explanation: string;
  links: string;
} {
  const urls =
    content.match(/https?:\/\/[^\s<>"']+/gi) ?? [];

  const uniqueUrls = [...new Set(
    urls.map((url) => url.replace(/[),.;!?]+$/, ""))
  )];

  let explanation = content;

  for (const url of uniqueUrls) {
    explanation = explanation.split(url).join("");
  }

  return {
    explanation: explanation.trim(),
    links: uniqueUrls.join("\n"),
  };
}

export default function CoursesScreen() {
  const [courses, setCourses] = useState<CourseworkDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] =
    useState<string | null>(null);

  const [courseID, setCourseID] = useState("");
  const [title, setTitle] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  const [selectedCourse, setSelectedCourse] =
    useState<CourseworkDTO | null>(null);

  const [lessons, setLessons] = useState<LessonDTO[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [lessonError, setLessonError] = useState("");

  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLessonId, setEditingLessonId] =
    useState<string | null>(null);

  const [lessonID, setLessonID] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] =
    useState<LessonType>("READING");
  const [lessonExplanation, setLessonExplanation] = useState("");
  const [lessonLinks, setLessonLinks] = useState("");
  const [savingLesson, setSavingLesson] = useState(false);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.coursework.getAll();

      if (!Array.isArray(data)) {
        throw new Error(
          "The coursework API did not return a list."
        );
      }

      setCourses(data);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  const resetCourseForm = () => {
    setCourseID("");
    setTitle("");
    setModuleName("");
    setDescription("");
    setDueDate("");
    setCreatedBy("");
    setEditingCourseId(null);
    setShowCourseForm(false);
  };

  const openCourseForm = (course?: CourseworkDTO) => {
    if (!course) {
      resetCourseForm();
      setShowCourseForm(true);
      return;
    }

    setCourseID(course.courseID);
    setTitle(course.title);
    setModuleName(course.module ?? "");
    setDescription(course.description ?? "");
    setDueDate(displayDate(course.dueDate) === "Not set"
      ? ""
      : displayDate(course.dueDate));
    setCreatedBy(course.createdBy);
    setEditingCourseId(course.courseID);
    setShowCourseForm(true);
  };

  const saveCourse = async () => {
    if (saving) return;

    if (
      !courseID.trim() ||
      !title.trim() ||
      !moduleName.trim() ||
      !description.trim() ||
      !createdBy.trim()
    ) {
      Alert.alert(
        "Missing Information",
        "Complete all required course fields."
      );
      return;
    }

    if (!validDate(dueDate.trim())) {
      Alert.alert(
        "Invalid Date",
        "Use YYYY-MM-DD or leave the date blank."
      );
      return;
    }

    const data: CourseworkDTO = {
      courseID: courseID.trim(),
      title: title.trim(),
      module: moduleName.trim(),
      description: description.trim(),
      dueDate: dueDate.trim()
        ? `${dueDate.trim()}T00:00:00`
        : null,
      createdBy: createdBy.trim(),
    };

    try {
      setSaving(true);

      if (editingCourseId) {
        // Preserve assessment associations when editing.
        const original = courses.find(
          (item) => item.courseID === editingCourseId
        );

        await api.coursework.update(editingCourseId, {
          ...data,
          preAssessment: original?.preAssessment ?? null,
          postAssessment: original?.postAssessment ?? null,
        });
      } else {
        await api.coursework.create(data);
      }

      resetCourseForm();
      await loadCourses();

      Alert.alert(
        "Success",
        editingCourseId
          ? "Course updated successfully."
          : "Course created successfully."
      );
    } catch (err) {
      Alert.alert("Save Failed", getError(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = (course: CourseworkDTO) => {
    Alert.alert(
      "Delete Course",
      `Delete "${course.title}" and its associated lessons? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.coursework.delete(course.courseID);

              if (
                selectedCourse?.courseID === course.courseID
              ) {
                setSelectedCourse(null);
                setLessons([]);
              }

              await loadCourses();
              Alert.alert("Success", "Course deleted.");
            } catch (err) {
              Alert.alert("Delete Failed", getError(err));
            }
          },
        },
      ]
    );
  };

  const loadLessons = async (id: string) => {
    try {
      setLoadingLessons(true);
      setLessonError("");

      const data = await api.lessons.getByCourse(id);

      if (!Array.isArray(data)) {
        throw new Error(
          "The lesson API did not return a list."
        );
      }

      setLessons(data);
    } catch (err) {
      setLessons([]);
      setLessonError(getError(err));
    } finally {
      setLoadingLessons(false);
    }
  };

  const manageLessons = (course: CourseworkDTO) => {
    setSelectedCourse(course);
    setShowCourseForm(false);
    resetLessonForm();
    void loadLessons(course.courseID);
  };

  const closeLessons = () => {
    setSelectedCourse(null);
    setLessons([]);
    setLessonError("");
    resetLessonForm();
  };

  const resetLessonForm = () => {
    setLessonID("");
    setLessonTitle("");
    setLessonType("READING");
    setLessonExplanation("");
    setLessonLinks("");
    setEditingLessonId(null);
    setShowLessonForm(false);
  };

  const openLessonForm = (lesson?: LessonDTO) => {
    if (!lesson) {
      resetLessonForm();
      setShowLessonForm(true);
      return;
    }

    const content = splitLessonContent(
      lesson.contentBody ?? ""
    );

    setLessonID(lesson.lessonID);
    setLessonTitle(lesson.title);
    setLessonType(
      lessonTypes.includes(lesson.contentType as LessonType)
        ? (lesson.contentType as LessonType)
        : "READING"
    );
    setLessonExplanation(content.explanation);
    setLessonLinks(content.links);
    setEditingLessonId(lesson.lessonID);
    setShowLessonForm(true);
  };

  const saveLesson = async () => {
    if (!selectedCourse || savingLesson) return;

    if (!lessonID.trim() || !lessonTitle.trim()) {
      Alert.alert(
        "Missing Information",
        "Lesson ID and title are required."
      );
      return;
    }

    const links = normaliseLinks(lessonLinks);

    const invalidLink = links.find((link) => {
      try {
        const parsed = new URL(link);
        return !["http:", "https:"].includes(parsed.protocol);
      } catch {
        return true;
      }
    });

    if (invalidLink) {
      Alert.alert(
        "Invalid Learning Link",
        `Enter complete HTTP or HTTPS URLs, one per line.\n\n${invalidLink}`
      );
      return;
    }

    const contentBody = [
      lessonExplanation.trim(),
      ...links,
    ]
      .filter(Boolean)
      .join("\n\n");

    if (!contentBody) {
      Alert.alert(
        "Missing Content",
        "Add a lesson explanation or a learning link."
      );
      return;
    }

    const lesson: LessonDTO = {
      lessonID: lessonID.trim(),
      title: lessonTitle.trim(),
      contentType: lessonType,
      contentBody,
    };

    try {
      setSavingLesson(true);

      if (editingLessonId) {
        await api.lessons.update(editingLessonId, lesson);
      } else {
        if (
          lessons.some(
            (item) => item.lessonID === lesson.lessonID
          )
        ) {
          Alert.alert(
            "Duplicate Lesson ID",
            "This course already contains that lesson ID."
          );
          return;
        }

        await api.lessons.create(
          selectedCourse.courseID,
          lesson
        );
      }

      const wasEditing = editingLessonId !== null;
      resetLessonForm();

      await loadLessons(selectedCourse.courseID);

      Alert.alert(
        "Success",
        wasEditing
          ? "Lesson updated successfully."
          : "Lesson created successfully."
      );
    } catch (err) {
      Alert.alert("Save Failed", getError(err));
    } finally {
      setSavingLesson(false);
    }
  };

  const deleteLesson = (lesson: LessonDTO) => {
    if (!selectedCourse) return;

    Alert.alert(
      "Delete Lesson",
      `Delete "${lesson.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.lessons.delete(lesson.lessonID);
              await loadLessons(selectedCourse.courseID);
              Alert.alert("Success", "Lesson deleted.");
            } catch (err) {
              Alert.alert("Delete Failed", getError(err));
            }
          },
        },
      ]
    );
  };

  const field = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    placeholder: string,
    options?: {
      multiline?: boolean;
      editable?: boolean;
    }
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          options?.multiline && styles.multiline,
          options?.editable === false && styles.disabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#888888"
        multiline={options?.multiline}
        textAlignVertical={
          options?.multiline ? "top" : "center"
        }
        editable={options?.editable !== false}
        autoCapitalize="none"
      />
    </View>
  );

  const actionButton = (
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    onPress: () => void,
    kind: "primary" | "outline" | "danger" = "outline",
    disabled = false
  ) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        kind === "primary" && styles.primaryButton,
        kind === "danger" && styles.dangerButton,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={18}
        color={
          kind === "primary"
            ? C.white
            : kind === "danger"
              ? C.danger
              : C.lightPurple
        }
      />
      <Text
        style={[
          styles.actionText,
          kind === "primary" && styles.primaryText,
          kind === "danger" && styles.dangerText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (selectedCourse) {
                closeLessons();
              } else {
                router.back();
              }
            }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={C.white}
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              {selectedCourse
                ? "Lesson Management"
                : "Course Management"}
            </Text>
            <Text style={styles.subtitle}>
              DevMate Admin Portal
            </Text>
          </View>
        </View>

        {selectedCourse ? (
          <>
            <View style={styles.introCard}>
              <Ionicons
                name="school-outline"
                size={32}
                color={C.lightPurple}
              />

              <Text style={styles.introTitle}>
                {selectedCourse.title}
              </Text>

              <Text style={styles.introText}>
                Course: {selectedCourse.courseID}
              </Text>

              <Text style={styles.introText}>
                Create mini-lessons and attach learning
                resources that students can open before
                their assessments.
              </Text>
            </View>

            {actionButton(
              showLessonForm
                ? "Close Lesson Form"
                : "Add Mini-Lesson",
              showLessonForm ? "close" : "add",
              () =>
                showLessonForm
                  ? resetLessonForm()
                  : openLessonForm(),
              "primary"
            )}

            {showLessonForm && (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>
                  {editingLessonId
                    ? "Edit Mini-Lesson"
                    : "Create Mini-Lesson"}
                </Text>

                {field(
                  "Lesson ID",
                  lessonID,
                  setLessonID,
                  "e.g. JAVA101-LESSON01",
                  { editable: !editingLessonId }
                )}

                {field(
                  "Lesson Title",
                  lessonTitle,
                  setLessonTitle,
                  "e.g. Introduction to Variables"
                )}

                <Text style={styles.label}>
                  Lesson Content Type
                </Text>

                <View style={styles.typeRow}>
                  {lessonTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        lessonType === type &&
                          styles.typeButtonActive,
                      ]}
                      onPress={() => setLessonType(type)}
                    >
                      <Text
                        style={[
                          styles.typeText,
                          lessonType === type &&
                            styles.typeTextActive,
                        ]}
                      >
                        {type.replace("_", " ")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {field(
                  "Lesson Explanation",
                  lessonExplanation,
                  setLessonExplanation,
                  "Explain the topic, give examples and describe what students should learn.",
                  { multiline: true }
                )}

                {field(
                  "Learning Resource Links",
                  lessonLinks,
                  setLessonLinks,
                  "https://example.com/tutorial\nhttps://example.com/video",
                  { multiline: true }
                )}

                <Text style={styles.helpText}>
                  Enter one complete URL per line. Links
                  will be saved in the lesson content and
                  displayed as clickable resources in the
                  student lesson screen.
                </Text>

                {actionButton(
                  savingLesson
                    ? "Saving..."
                    : editingLessonId
                      ? "Update Lesson"
                      : "Save Lesson",
                  "save-outline",
                  () => void saveLesson(),
                  "primary",
                  savingLesson
                )}
              </View>
            )}

            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>
                Course Lessons
              </Text>

              <TouchableOpacity
                onPress={() =>
                  void loadLessons(selectedCourse.courseID)
                }
                disabled={loadingLessons}
              >
                <Ionicons
                  name="refresh"
                  size={22}
                  color={C.lightPurple}
                />
              </TouchableOpacity>
            </View>

            {loadingLessons ? (
              <View style={styles.emptyCard}>
                <ActivityIndicator color={C.purple} />
                <Text style={styles.emptyText}>
                  Loading lessons...
                </Text>
              </View>
            ) : lessonError ? (
              <View style={styles.emptyCard}>
                <Text style={styles.errorText}>
                  {lessonError}
                </Text>

                {actionButton(
                  "Try Again",
                  "refresh",
                  () =>
                    void loadLessons(selectedCourse.courseID),
                  "outline"
                )}
              </View>
            ) : lessons.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="document-text-outline"
                  size={36}
                  color={C.lightPurple}
                />
                <Text style={styles.emptyTitle}>
                  No Lessons Yet
                </Text>
                <Text style={styles.emptyText}>
                  Add the first mini-lesson for this course.
                </Text>
              </View>
            ) : (
              lessons.map((lesson, index) => {
                const content = splitLessonContent(
                  lesson.contentBody ?? ""
                );

                return (
                  <View
                    key={lesson.lessonID}
                    style={styles.courseItem}
                  >
                    <Text style={styles.courseTitle}>
                      {index + 1}. {lesson.title}
                    </Text>

                    <Text style={styles.courseDetail}>
                      ID: {lesson.lessonID}
                    </Text>

                    <Text style={styles.courseDetail}>
                      Type: {lesson.contentType}
                    </Text>

                    {content.explanation ? (
                      <Text
                        style={styles.courseDescription}
                        numberOfLines={4}
                      >
                        {content.explanation}
                      </Text>
                    ) : null}

                    {content.links ? (
                      <Text style={styles.linkPreview}>
                        {normaliseLinks(content.links).length}
                        {" "}learning resource(s)
                      </Text>
                    ) : null}

                    <View style={styles.actions}>
                      {actionButton(
                        "Edit",
                        "create-outline",
                        () => openLessonForm(lesson)
                      )}

                      {actionButton(
                        "Delete",
                        "trash-outline",
                        () => deleteLesson(lesson),
                        "danger"
                      )}
                    </View>
                  </View>
                );
              })
            )}

            {actionButton(
              "Back to Courses",
              "arrow-back",
              closeLessons
            )}
          </>
        ) : (
          <>
            <View style={styles.introCard}>
              <Ionicons
                name="book-outline"
                size={32}
                color={C.lightPurple}
              />

              <Text style={styles.introTitle}>
                Manage Learning Courses
              </Text>

              <Text style={styles.introText}>
                Create and update coursework, then
                manage the mini-lessons within each course.
              </Text>
            </View>

            {actionButton(
              showCourseForm
                ? "Close Course Form"
                : "Add New Course",
              showCourseForm ? "close" : "add",
              () =>
                showCourseForm
                  ? resetCourseForm()
                  : openCourseForm(),
              "primary"
            )}

            {showCourseForm && (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>
                  {editingCourseId
                    ? "Edit Course"
                    : "Create Course"}
                </Text>

                {field(
                  "Course ID",
                  courseID,
                  setCourseID,
                  "e.g. PYTHON101",
                  { editable: !editingCourseId }
                )}

                {field(
                  "Course Title",
                  title,
                  setTitle,
                  "Enter course title"
                )}

                {field(
                  "Module",
                  moduleName,
                  setModuleName,
                  "Enter module"
                )}

                {field(
                  "Description",
                  description,
                  setDescription,
                  "Describe the coursework",
                  { multiline: true }
                )}

                {field(
                  "Due Date (YYYY-MM-DD)",
                  dueDate,
                  setDueDate,
                  "2026-12-15"
                )}

                {field(
                  "Created By",
                  createdBy,
                  setCreatedBy,
                  "Enter creator identifier"
                )}

                {actionButton(
                  saving
                    ? "Saving..."
                    : editingCourseId
                      ? "Update Course"
                      : "Save Course",
                  "save-outline",
                  () => void saveCourse(),
                  "primary",
                  saving
                )}
              </View>
            )}

            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>
                Existing Courses
              </Text>

              <TouchableOpacity
                onPress={() => void loadCourses()}
                disabled={loading}
              >
                <Ionicons
                  name="refresh"
                  size={22}
                  color={C.lightPurple}
                />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.emptyCard}>
                <ActivityIndicator
                  size="large"
                  color={C.purple}
                />
                <Text style={styles.emptyText}>
                  Loading courses...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={34}
                  color={C.danger}
                />

                <Text style={styles.emptyTitle}>
                  Unable to Load Courses
                </Text>

                <Text style={styles.emptyText}>
                  {error}
                </Text>

                {actionButton(
                  "Try Again",
                  "refresh",
                  () => void loadCourses(),
                  "primary"
                )}
              </View>
            ) : courses.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="folder-open-outline"
                  size={36}
                  color={C.lightPurple}
                />

                <Text style={styles.emptyTitle}>
                  No Courses Yet
                </Text>

                <Text style={styles.emptyText}>
                  Add your first course to begin creating
                  mini-lessons.
                </Text>
              </View>
            ) : (
              courses.map((course) => (
                <View
                  key={course.courseID}
                  style={styles.courseItem}
                >
                  <View style={styles.courseTop}>
                    <View style={styles.courseIcon}>
                      <Ionicons
                        name="book-outline"
                        size={22}
                        color={C.lightPurple}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.courseTitle}>
                        {course.title}
                      </Text>

                      <Text style={styles.courseId}>
                        {course.courseID}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.courseDescription}>
                    {course.description ?? ""}
                  </Text>

                  <Text style={styles.courseDetail}>
                    Module: {course.module || "Not set"}
                  </Text>

                  <Text style={styles.courseDetail}>
                    Due: {displayDate(course.dueDate)}
                  </Text>

                  <Text style={styles.courseDetail}>
                    Created by: {course.createdBy}
                  </Text>

                  {actionButton(
                    "Manage Lessons",
                    "school-outline",
                    () => manageLessons(course),
                    "primary"
                  )}

                  <View style={styles.actions}>
                    {actionButton(
                      "Edit",
                      "create-outline",
                      () => openCourseForm(course)
                    )}

                    {actionButton(
                      "Delete",
                      "trash-outline",
                      () => deleteCourse(course),
                      "danger"
                    )}
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 25,
  },
  backButton: {
    width: 42,
    height: 42,
    backgroundColor: C.card,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: C.white,
    fontSize: 23,
    fontWeight: "bold",
  },
  subtitle: {
    color: C.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  introCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 22,
    marginBottom: 20,
  },
  introTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 8,
  },
  introText: {
    color: C.secondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  formCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 18,
    marginVertical: 18,
  },
  formTitle: {
    color: C.white,
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: C.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 9,
  },
  input: {
    backgroundColor: C.input,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 14,
    color: C.white,
    fontSize: 15,
    minHeight: 48,
  },
  multiline: {
    minHeight: 120,
  },
  disabled: {
    opacity: 0.5,
  },
  helpText: {
    color: C.secondary,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 18,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  typeButtonActive: {
    backgroundColor: "#2D2140",
    borderColor: C.purple,
  },
  typeText: {
    color: C.secondary,
    fontSize: 12,
    fontWeight: "600",
  },
  typeTextActive: {
    color: C.lightPurple,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.purple,
    borderRadius: 10,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: C.purple,
    borderColor: C.purple,
  },
  dangerButton: {
    borderColor: C.danger,
  },
  actionText: {
    color: C.lightPurple,
    fontSize: 14,
    fontWeight: "700",
  },
  primaryText: {
    color: C.white,
  },
  dangerText: {
    color: C.danger,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 14,
  },
  sectionTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    marginBottom: 15,
  },
  emptyTitle: {
    color: C.white,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 14,
  },
  emptyText: {
    color: C.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 12,
  },
  errorText: {
    color: C.danger,
    fontSize: 13,
    marginBottom: 16,
  },
  courseItem: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  courseTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  courseIcon: {
    width: 44,
    height: 44,
    backgroundColor: "#2D2140",
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  courseTitle: {
    color: C.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  courseId: {
    color: C.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  courseDescription: {
    color: C.secondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  courseDetail: {
    color: C.secondary,
    fontSize: 12,
    marginBottom: 7,
  },
  linkPreview: {
    color: C.lightPurple,
    fontSize: 13,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 15,
  },
});
