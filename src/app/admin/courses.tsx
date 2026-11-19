
import React, { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import api, { CourseworkDTO } from "../../constants/api";

const COLORS = {
  background: "#0D0D0D",
  card: "#1A1A1A",
  input: "#292929",
  purple: "#8B5CF6",
  lightPurple: "#A78BFA",
  white: "#FFFFFF",
  grey: "#AAAAAA",
  red: "#FF6B6B",
  border: "#333333",
};

const emptyForm = {
  title: "",
  module: "",
  description: "",
  dueDate: "",
  createdBy: "",
};

export default function CoursesScreen() {
  const [courses, setCourses] = useState<CourseworkDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [editingCourse, setEditingCourse] =
    useState<CourseworkDTO | null>(null);

  const [form, setForm] = useState(emptyForm);

  // =====================================================
  // LOAD EXISTING COURSES
  // =====================================================

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.coursework.getAll();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response from the server.");
      }

      setCourses(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCourses();
    }, [loadCourses])
  );

  // =====================================================
  // SEARCH COURSES
  // =====================================================

  const filteredCourses = courses.filter((course) => {
    const query = search.trim().toLowerCase();

    return [
      course.courseID,
      course.title,
      course.module,
      course.description,
    ].some((value) =>
      (value ?? "").toLowerCase().includes(query)
    );
  });

  // =====================================================
  // CREATE NEW COURSE NAVIGATION
  // =====================================================

  function openCreateCourse() {
    router.push("/club-admin/coursework");
  }

  // =====================================================
  // EDIT EXISTING COURSE
  // =====================================================

  function openEdit(course: CourseworkDTO) {
    setEditingCourse(course);

    setForm({
      title: course.title ?? "",
      module: course.module ?? "",
      description: course.description ?? "",
      dueDate: course.dueDate?.slice(0, 10) ?? "",
      createdBy: course.createdBy ?? "",
    });
  }

  function closeEdit() {
    if (saving) return;

    setEditingCourse(null);
    setForm(emptyForm);
  }

  function updateField(
    key: keyof typeof emptyForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function validDate(value: string) {
    if (!value) return true;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const [year, month, day] = value
      .split("-")
      .map(Number);

    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  async function saveEdit() {
    if (!editingCourse || saving) return;

    if (
      !form.title.trim() ||
      !form.module.trim() ||
      !form.description.trim() ||
      !form.createdBy.trim()
    ) {
      Alert.alert(
        "Missing Information",
        "Complete all required fields."
      );
      return;
    }

    if (!validDate(form.dueDate.trim())) {
      Alert.alert(
        "Invalid Date",
        "Enter a valid date in YYYY-MM-DD format."
      );
      return;
    }

    try {
      setSaving(true);

      const updatedCourse: CourseworkDTO = {
        courseID: editingCourse.courseID,
        title: form.title.trim(),
        module: form.module.trim(),
        description: form.description.trim(),
        createdBy: form.createdBy.trim(),

        dueDate: form.dueDate.trim()
          ? `${form.dueDate.trim()}T00:00:00`
          : null,

        // Preserve the existing linked assessments.
        preAssessment:
          editingCourse.preAssessment ?? null,

        postAssessment:
          editingCourse.postAssessment ?? null,
      };

      await api.coursework.update(
        editingCourse.courseID,
        updatedCourse
      );

      setEditingCourse(null);
      setForm(emptyForm);

      await loadCourses();

      Alert.alert(
        "Success",
        "Course updated successfully."
      );
    } catch (err) {
      Alert.alert(
        "Update Failed",
        err instanceof Error
          ? err.message
          : "Unable to update the course."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // DELETE EXISTING COURSE
  // =====================================================

  function deleteCourse(course: CourseworkDTO) {
    Alert.alert(
      "Delete Course",
      `Are you sure you want to delete "${course.title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.coursework.delete(
                course.courseID
              );

              await loadCourses();

              Alert.alert(
                "Success",
                "Course deleted successfully."
              );
            } catch (err) {
              Alert.alert(
                "Delete Failed",
                err instanceof Error
                  ? err.message
                  : "Unable to delete the course."
              );
            }
          },
        },
      ]
    );
  }

  // =====================================================
  // MAIN SCREEN
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/club-admin")}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              Course Management
            </Text>

            <Text style={styles.headerSubtitle}>
              DevMate Admin Portal
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Create and manage programming courses
          for coding club students.
        </Text>

        {/* COURSE SUMMARY */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="library-outline"
              size={27}
              color={COLORS.lightPurple}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>
              Total Courses
            </Text>

            <Text style={styles.summaryNumber}>
              {courses.length}
            </Text>
          </View>
        </View>

        {/* CREATE NEW COURSE */}

        <TouchableOpacity
          style={styles.addButton}
          onPress={openCreateCourse}
          activeOpacity={0.8}
        >
          <Ionicons
            name="add-circle-outline"
            size={23}
            color={COLORS.white}
          />

          <Text style={styles.addButtonText}>
            Add New Course
          </Text>
        </TouchableOpacity>

        {/* SEARCH */}

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={21}
            color={COLORS.grey}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor="#888888"
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.grey}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* EXISTING COURSES HEADER */}

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            Existing Courses
          </Text>

          <TouchableOpacity
            onPress={() => void loadCourses()}
            disabled={loading}
          >
            <Ionicons
              name="refresh-outline"
              size={24}
              color={COLORS.lightPurple}
            />
          </TouchableOpacity>
        </View>

        {/* LOADING STATE */}

        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator
              size="large"
              color={COLORS.purple}
            />

            <Text style={styles.emptyText}>
              Loading courses...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="alert-circle-outline"
              size={38}
              color={COLORS.red}
            />

            <Text style={styles.emptyTitle}>
              Unable to Load Courses
            </Text>

            <Text style={styles.emptyText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => void loadCourses()}
            >
              <Text style={styles.addButtonText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredCourses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="book-outline"
              size={42}
              color={COLORS.lightPurple}
            />

            <Text style={styles.emptyTitle}>
              {courses.length === 0
                ? "No Courses Yet"
                : "No Matching Courses"}
            </Text>

            <Text style={styles.emptyText}>
              {courses.length === 0
                ? "Create your first programming course."
                : "Try a different search."}
            </Text>
          </View>
        ) : (
          filteredCourses.map((course) => (
            <View
              key={course.courseID}
              style={styles.courseCard}
            >
              {/* COURSE TITLE */}

              <View style={styles.courseHeader}>
                <View style={styles.courseIcon}>
                  <Ionicons
                    name="book-outline"
                    size={25}
                    color={COLORS.lightPurple}
                  />
                </View>

                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>
                    {course.title}
                  </Text>

                  <Text style={styles.courseID}>
                    {course.courseID}
                  </Text>
                </View>
              </View>

              {/* COURSE DESCRIPTION */}

              <Text style={styles.description}>
                {course.description ||
                  "No description provided."}
              </Text>

              {/* COURSE DETAILS */}

              <View style={styles.detailRow}>
                <Ionicons
                  name="layers-outline"
                  size={17}
                  color={COLORS.lightPurple}
                />

                <Text style={styles.detailText}>
                  Module: {course.module || "Not set"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color={COLORS.lightPurple}
                />

                <Text style={styles.detailText}>
                  Due:{" "}
                  {course.dueDate
                    ? course.dueDate.slice(0, 10)
                    : "Not set"}
                </Text>
              </View>

              {/* ASSESSMENT STATUS */}

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusBadge,
                    !course.preAssessment &&
                      styles.pendingBadge,
                  ]}
                >
                  <Ionicons
                    name={
                      course.preAssessment
                        ? "checkmark-circle-outline"
                        : "time-outline"
                    }
                    size={15}
                    color={
                      course.preAssessment
                        ? "#4ADE80"
                        : COLORS.grey
                    }
                  />

                  <Text
                    style={[
                      styles.statusText,
                      !course.preAssessment &&
                        styles.pendingText,
                    ]}
                  >
                    Pre-test
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    !course.postAssessment &&
                      styles.pendingBadge,
                  ]}
                >
                  <Ionicons
                    name={
                      course.postAssessment
                        ? "checkmark-circle-outline"
                        : "time-outline"
                    }
                    size={15}
                    color={
                      course.postAssessment
                        ? "#4ADE80"
                        : COLORS.grey
                    }
                  />

                  <Text
                    style={[
                      styles.statusText,
                      !course.postAssessment &&
                        styles.pendingText,
                    ]}
                  >
                    Post-test
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* EDIT AND DELETE BUTTONS */}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEdit(course)}
                >
                  <Ionicons
                    name="create-outline"
                    size={19}
                    color={COLORS.white}
                  />

                  <Text style={styles.editText}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteCourse(course)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color={COLORS.red}
                  />

                  <Text style={styles.deleteText}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* EDIT COURSE MODAL */}

      <Modal
        visible={editingCourse !== null}
        animationType="slide"
        transparent
        onRequestClose={closeEdit}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={
            Platform.OS === "ios" ? "padding" : undefined
          }
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit Course
              </Text>

              <TouchableOpacity
                onPress={closeEdit}
                disabled={saving}
              >
                <Ionicons
                  name="close"
                  size={25}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>
                Course ID
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.disabledInput,
                ]}
                value={editingCourse?.courseID ?? ""}
                editable={false}
              />

              <Text style={styles.label}>
                Course Title
              </Text>

              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(value) =>
                  updateField("title", value)
                }
                placeholder="Enter course title"
                placeholderTextColor="#888888"
                editable={!saving}
              />

              <Text style={styles.label}>
                Module
              </Text>

              <TextInput
                style={styles.input}
                value={form.module}
                onChangeText={(value) =>
                  updateField("module", value)
                }
                placeholder="Enter module"
                placeholderTextColor="#888888"
                editable={!saving}
              />

              <Text style={styles.label}>
                Description
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.multiline,
                ]}
                value={form.description}
                onChangeText={(value) =>
                  updateField("description", value)
                }
                multiline
                textAlignVertical="top"
                placeholder="Course description"
                placeholderTextColor="#888888"
                editable={!saving}
              />

              <Text style={styles.label}>
                Due Date (YYYY-MM-DD)
              </Text>

              <TextInput
                style={styles.input}
                value={form.dueDate}
                onChangeText={(value) =>
                  updateField("dueDate", value)
                }
                placeholder="2026-12-01"
                placeholderTextColor="#888888"
                editable={!saving}
              />

              <Text style={styles.label}>
                Created By
              </Text>

              <TextInput
                style={styles.input}
                value={form.createdBy}
                onChangeText={(value) =>
                  updateField("createdBy", value)
                }
                placeholder="Creator identifier"
                placeholderTextColor="#888888"
                editable={!saving}
              />

              <View style={styles.notice}>
                <Ionicons
                  name="information-circle-outline"
                  size={21}
                  color={COLORS.lightPurple}
                />

                <Text style={styles.noticeText}>
                  Updating course information will
                  preserve the existing linked
                  assessments.
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeEdit}
                  disabled={saving}
                >
                  <Text style={styles.editText}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    saving && styles.disabledInput,
                  ]}
                  onPress={() => void saveEdit()}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator
                      color={COLORS.white}
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="save-outline"
                        size={18}
                        color={COLORS.white}
                      />
                      <Text style={styles.editText}>
                        Save Changes
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// =======================================================
// STYLES
// =======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 18,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 11,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: COLORS.grey,
    fontSize: 12,
    marginTop: 4,
  },

  subtitle: {
    color: COLORS.grey,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },

  summaryCard: {
    backgroundColor: "#211832",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#382653",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 18,
  },

  summaryIcon: {
    backgroundColor: "#34234D",
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryLabel: {
    color: COLORS.grey,
    fontSize: 13,
  },

  summaryNumber: {
    color: COLORS.white,
    fontSize: 27,
    fontWeight: "bold",
    marginTop: 4,
  },

  addButton: {
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 18,
  },

  addButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
  },

  searchContainer: {
    backgroundColor: COLORS.input,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 22,
  },

  searchInput: {
    flex: 1,
    minHeight: 49,
    color: COLORS.white,
    fontSize: 14,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },

  courseCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#272727",
  },

  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 11,
    backgroundColor: "#2D2140",
    alignItems: "center",
    justifyContent: "center",
  },

  courseInfo: {
    flex: 1,
  },

  courseTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 22,
  },

  courseID: {
    color: COLORS.lightPurple,
    fontSize: 12,
    marginTop: 5,
  },

  description: {
    color: "#CCCCCC",
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 15,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  detailText: {
    flex: 1,
    color: COLORS.grey,
    fontSize: 13,
    lineHeight: 19,
  },

  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 7,
    marginBottom: 6,
  },

  statusBadge: {
    backgroundColor: "#163321",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  pendingBadge: {
    backgroundColor: "#292929",
  },

  statusText: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "600",
  },

  pendingText: {
    color: COLORS.grey,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },

  actions: {
    flexDirection: "row",
    gap: 11,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#312047",
    borderWidth: 1,
    borderColor: COLORS.purple,
    borderRadius: 10,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  editText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "bold",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#342020",
    borderWidth: 1,
    borderColor: "#713737",
    borderRadius: 10,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  deleteText: {
    color: COLORS.red,
    fontSize: 13,
    fontWeight: "bold",
  },

  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 30,
    alignItems: "center",
  },

  emptyTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 15,
  },

  emptyText: {
    color: COLORS.grey,
    fontSize: 13,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },

  retryButton: {
    backgroundColor: COLORS.purple,
    borderRadius: 10,
    paddingHorizontal: 23,
    paddingVertical: 12,
    marginTop: 17,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    backgroundColor: COLORS.card,
    borderRadius: 17,
    padding: 20,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 23,
  },

  modalTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "bold",
  },

  label: {
    color: "#DDDDDD",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 9,
  },

  input: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.white,
    borderRadius: 10,
    padding: 14,
    minHeight: 49,
    marginBottom: 17,
    fontSize: 14,
  },

  disabledInput: {
    opacity: 0.5,
  },

  multiline: {
    minHeight: 110,
  },

  notice: {
    backgroundColor: "#211832",
    padding: 13,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 20,
  },

  noticeText: {
    flex: 1,
    color: "#C4B5FD",
    fontSize: 12,
    lineHeight: 19,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#333333",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButton: {
    flex: 1.5,
    backgroundColor: COLORS.purple,
    padding: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
});
