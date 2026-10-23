
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

import api, { CourseworkDTO } from "../../constants/api";

const COLORS = {
  background: "#0D0D0D",
  card: "#1A1A1A",
  input: "#242424",
  purple: "#8B5CF6",
  lightPurple: "#A78BFA",
  white: "#FFFFFF",
  secondary: "#A3A3A3",
  border: "#292929",
  danger: "#EF4444",
};

export default function CoursesScreen() {
  const [courses, setCourses] = useState<CourseworkDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Course form fields
  const [courseID, setCourseID] = useState("");
  const [title, setTitle] = useState("");
  const [module, setModule] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  // Load real coursework from Spring Boot
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.coursework.getAll();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from coursework API.");
      }

      setCourses(data);
    } catch (err: any) {
      setError(err?.message || "Unable to load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Clear the form
  function resetForm() {
    setCourseID("");
    setTitle("");
    setModule("");
    setDescription("");
    setDueDate("");
    setCreatedBy("");
    setEditingId(null);
    setShowForm(false);
  }

  // Open form for new course
  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  // Open form with existing course information
  function openEditForm(course: CourseworkDTO) {
    setCourseID(course.courseID);
    setTitle(course.title);
    setModule(course.module);
    setDescription(course.description);
    setDueDate(course.dueDate);
    setCreatedBy(course.createdBy);
    setEditingId(course.courseID);
    setShowForm(true);
  }

  
  // Validate required course information

  function validateForm() {
    if (
      !courseID.trim() ||
      !title.trim() ||
      !module.trim() ||
      !description.trim() ||
      !createdBy.trim()
    ) {
      Alert.alert(
        "Missing Information",
        "Please complete all required course fields."
      );
      return false;
    }

    return true;
  }

  // Save course to Spring Boot
  async function handleSave() {
    if (!validateForm() || saving) {
      return;
    }

    const data: CourseworkDTO = {
      courseID: courseID.trim(),
      title: title.trim(),
      module: module.trim(),
      description: description.trim(),
      dueDate: dueDate.trim(),
      createdBy: createdBy.trim(),
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.coursework.update(editingId, data);

        Alert.alert(
          "Course Updated",
          "The coursework record was updated successfully."
        );
      } else {
        await api.coursework.create(data);

        Alert.alert(
          "Course Created",
          "The coursework record was created successfully."
        );
      }

      resetForm();
      await loadCourses();
    } catch (err: any) {
      Alert.alert(
        "Save Failed",
        err?.message || "Unable to save course."
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete an existing course
  function handleDelete(course: CourseworkDTO) {
    Alert.alert(
      "Delete Course",
      `Are you sure you want to delete "${course.title}"?`,
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
              await api.coursework.delete(course.courseID);

              Alert.alert(
                "Course Deleted",
                "The coursework record was deleted successfully."
              );

              await loadCourses();
            } catch (err: any) {
              Alert.alert(
                "Delete Failed",
                err?.message || "Unable to delete course."
              );
            }
          },
        },
      ]
    );
  }

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Course Management
            </Text>

            <Text style={styles.subtitle}>
              DevMate Admin Portal
            </Text>
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.introCard}>
          <Ionicons
            name="book-outline"
            size={32}
            color={COLORS.lightPurple}
          />

          <Text style={styles.introTitle}>
            Manage Learning Courses
          </Text>

          <Text style={styles.introText}>
            Create, update and delete coursework
            through the DevMate backend.
          </Text>
        </View>

        {/* Add course button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (showForm) {
              resetForm();
            } else {
              openAddForm();
            }
          }}
          disabled={saving}
        >
          <Ionicons
            name={showForm ? "close" : "add"}
            size={22}
            color={COLORS.white}
          />

          <Text style={styles.addButtonText}>
            {showForm ? "Close Form" : "Add New Course"}
          </Text>
        </TouchableOpacity>

        {/* Course form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingId !== null
                ? "Edit Course"
                : "Create Course"}
            </Text>

            <Text style={styles.label}>Course ID</Text>
            <TextInput
              style={[
                styles.input,
                editingId !== null && styles.disabledInput,
              ]}
              placeholder="e.g. PYTHON101"
              placeholderTextColor="#888888"
              value={courseID}
              onChangeText={setCourseID}
              autoCapitalize="characters"
              editable={editingId === null}
            />

            <Text style={styles.label}>Course Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter course title"
              placeholderTextColor="#888888"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Module</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter module"
              placeholderTextColor="#888888"
              value={module}
              onChangeText={setModule}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Describe the coursework"
              placeholderTextColor="#888888"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.label}>
              Due Date (YYYY-MM-DD)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="2026-10-30"
              placeholderTextColor="#888888"
              value={dueDate}
              onChangeText={setDueDate}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Created By</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter creator identifier"
              placeholderTextColor="#888888"
              value={createdBy}
              onChangeText={setCreatedBy}
            />

            <TouchableOpacity
              style={[
                styles.saveButton,
                saving && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color={COLORS.white}
                  />

                  <Text style={styles.saveButtonText}>
                    {editingId !== null
                      ? "Update Course"
                      : "Save Course"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Existing courses */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            Existing Courses
          </Text>

          <TouchableOpacity
            onPress={loadCourses}
            disabled={loading}
          >
            <Ionicons
              name="refresh"
              size={22}
              color={COLORS.lightPurple}
            />
          </TouchableOpacity>
        </View>

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
              size={34}
              color={COLORS.danger}
            />

            <Text style={styles.emptyTitle}>
              Unable to Load Courses
            </Text>

            <Text style={styles.emptyText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadCourses}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : courses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="folder-open-outline"
              size={34}
              color={COLORS.lightPurple}
            />

            <Text style={styles.emptyTitle}>
              No Courses Yet
            </Text>

            <Text style={styles.emptyText}>
              There are no coursework records in
              the backend. Add your first course.
            </Text>
          </View>
        ) : (
          courses.map((course) => (
            <View
              key={course.courseID}
              style={styles.courseItem}
            >
              <View style={styles.courseTop}>
                <View style={styles.courseItemIcon}>
                  <Ionicons
                    name="book-outline"
                    size={22}
                    color={COLORS.lightPurple}
                  />
                </View>

                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>
                    {course.title}
                  </Text>

                  <Text style={styles.courseId}>
                    {course.courseID}
                  </Text>
                </View>
              </View>

              <Text style={styles.courseDescription}>
                {course.description}
              </Text>

              <Text style={styles.courseDetail}>
                Module: {course.module}
              </Text>

              <Text style={styles.courseDetail}>
                Due: {course.dueDate}
              </Text>

              <Text style={styles.courseDetail}>
                Created by: {course.createdBy}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditForm(course)}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={COLORS.lightPurple}
                  />

                  <Text style={styles.editText}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(course)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={COLORS.danger}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 50,
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
    backgroundColor: COLORS.card,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "bold",
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  introCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 22,
    marginBottom: 20,
  },
  introTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 8,
  },
  introText: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 28,
  },
  formTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 9,
  },
  input: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    color: COLORS.white,
    fontSize: 15,
    marginBottom: 18,
  },
  disabledInput: {
    opacity: 0.5,
  },
  descriptionInput: {
    minHeight: 110,
  },
  saveButton: {
    backgroundColor: COLORS.purple,
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 9,
    textAlign: "center",
  },
  emptyText: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9,
    marginTop: 18,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  courseItem: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  courseTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  courseItemIcon: {
    width: 44,
    height: 44,
    backgroundColor: "#2D2140",
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  courseId: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  courseDescription: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  courseDetail: {
    color: COLORS.secondary,
    fontSize: 12,
    marginBottom: 7,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 15,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.purple,
    borderRadius: 9,
    padding: 12,
  },
  editText: {
    color: COLORS.lightPurple,
    fontWeight: "bold",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 9,
    padding: 12,
  },
  deleteText: {
    color: COLORS.danger,
    fontWeight: "bold",
  },
});
