
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Student = {
  id: number;
  name: string;
  email: string;
  course: string;
  status: "Active" | "Inactive";
};

type StudentStatus = "Active" | "Inactive";
type StudentFilter = "All" | StudentStatus;

export default function ManageStudentsScreen() {
  // Temporary frontend state.
  // Real students must eventually come from the backend.
  const [students, setStudents] = useState<Student[]>([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StudentFilter>("All");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [status, setStatus] = useState<StudentStatus>("Active");

  // Search and filter students
  const filteredStudents = students.filter((student) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      student.name.toLowerCase().includes(searchText) ||
      student.email.toLowerCase().includes(searchText) ||
      student.course.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "All" || student.status === filter;

    return matchesSearch && matchesFilter;
  });

  function resetForm() {
    setName("");
    setEmail("");
    setCourse("");
    setStatus("Active");
    setEditingId(null);
  }

  function closeModal() {
    setModalVisible(false);
    resetForm();
  }

  function openAddModal() {
    resetForm();
    setModalVisible(true);
  }

  function openEditModal(student: Student) {
    setEditingId(student.id);
    setName(student.name);
    setEmail(student.email);
    setCourse(student.course);
    setStatus(student.status);
    setModalVisible(true);
  }

  // Save only to the temporary screen state
  function saveStudent() {
    const studentName = name.trim();
    const studentEmail = email.trim().toLowerCase();
    const studentCourse = course.trim();

    if (!studentName || !studentEmail || !studentCourse) {
      Alert.alert(
        "Missing Information",
        "Please complete all fields."
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(studentEmail)) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    const duplicateEmail = students.some(
      (student) =>
        student.email.toLowerCase() === studentEmail &&
        student.id !== editingId
    );

    if (duplicateEmail) {
      Alert.alert(
        "Duplicate Email",
        "A student with this email already exists in this list."
      );
      return;
    }

    if (editingId !== null) {
      setStudents((current) =>
        current.map((student) =>
          student.id === editingId
            ? {
                ...student,
                name: studentName,
                email: studentEmail,
                course: studentCourse,
                status: status,
              }
            : student
        )
      );
    } else {
      const newStudent: Student = {
        id: Date.now(),
        name: studentName,
        email: studentEmail,
        course: studentCourse,
        status: status,
      };

      setStudents((current) => [...current, newStudent]);
    }

    closeModal();

    Alert.alert(
      "Local Changes Saved",
      "The student was updated in this screen only. No database changes were made."
    );
  }

  // Remove a student from the temporary list only
  function deleteStudent(student: Student) {
    Alert.alert(
      "Remove Student",
      `Remove ${student.name} from this temporary list? This does not delete their actual account.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setStudents((current) =>
              current.filter((item) => item.id !== student.id)
            );
          },
        },
      ]
    );
  }

  function goBack() {
    router.replace("/admin/adminindex");
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          accessibilityRole="button"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Manage Students
          </Text>

          <Text style={styles.headerSubtitle}>
            DevMate Admin Portal
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Manage coding club student records.
        </Text>

        {/* DATA STATUS */}
        <View style={styles.noticeCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#A78BFA"
          />

          <Text style={styles.demoNotice}>
            Local preview only. Changes are not saved
            to Firebase or MySQL.
          </Text>
        </View>

        {/* STUDENT SUMMARY */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="people-outline"
              size={25}
              color="#A78BFA"
            />
          </View>

          <View>
            <Text style={styles.summaryLabel}>
              Students in this session
            </Text>

            <Text style={styles.summaryValue}>
              {students.length}
            </Text>
          </View>
        </View>

        {/* ADD STUDENT */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
          accessibilityRole="button"
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.addButtonText}>
            Add Student
          </Text>
        </TouchableOpacity>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#888888"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email or course..."
            placeholderTextColor="#888888"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>

        {/* FILTERS */}
        <View style={styles.filterRow}>
          {(["All", "Active", "Inactive"] as const).map(
            (item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterButton,
                  filter === item && styles.activeFilter,
                ]}
                onPress={() => setFilter(item)}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item && styles.activeFilterText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* STUDENT LIST */}
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="people-outline"
                  size={32}
                  color="#A78BFA"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No students found
              </Text>

              <Text style={styles.emptyText}>
                {students.length === 0
                  ? "No students have been added to this temporary list."
                  : "Try a different search or status filter."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>
                  {item.name}
                </Text>

                <Text style={styles.studentDetail}>
                  {item.email}
                </Text>

                <Text style={styles.studentDetail}>
                  {item.course}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    item.status === "Active"
                      ? styles.activeBadge
                      : styles.inactiveBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.status === "Active"
                        ? styles.activeStatus
                        : styles.inactiveStatus,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditModal(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.name}`}
                >
                  <Ionicons
                    name="create-outline"
                    size={21}
                    color="#A78BFA"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => deleteStudent(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.name}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={21}
                    color="#FF6B6B"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      {/* ADD / EDIT MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingId !== null
                    ? "Edit Student"
                    : "Add Student"}
                </Text>

                <TouchableOpacity
                  onPress={closeModal}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="close"
                    size={23}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>
                Full Name
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="#888888"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.fieldLabel}>
                Email Address
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor="#888888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.fieldLabel}>
                Course
              </Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. Python Programming"
                placeholderTextColor="#888888"
                value={course}
                onChangeText={setCourse}
              />

              <Text style={styles.fieldLabel}>
                Student Status
              </Text>

              <View style={styles.filterRow}>
                {(["Active", "Inactive"] as const).map(
                  (item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.filterButton,
                        status === item &&
                          styles.activeFilter,
                      ]}
                      onPress={() => setStatus(item)}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.filterText,
                          status === item &&
                            styles.activeFilterText,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                  accessibilityRole="button"
                >
                  <Text style={styles.cancelText}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveStudent}
                  accessibilityRole="button"
                >
                  <Text style={styles.saveText}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: "#888888",
    fontSize: 12,
    marginTop: 4,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  subtitle: {
    color: "#A3A3A3",
    fontSize: 13,
    marginBottom: 14,
  },

  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#17131F",
    borderColor: "#2D2140",
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    marginBottom: 18,
  },

  demoNotice: {
    color: "#D8B4FE",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    marginLeft: 10,
  },

  summaryCard: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 12,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2D2140",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  summaryLabel: {
    color: "#A3A3A3",
    fontSize: 12,
  },

  summaryValue: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 5,
  },

  addButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 17,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 9,
  },

  searchContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#333333",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 15,
  },

  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 13,
  },

  filterRow: {
    flexDirection: "row",
    marginBottom: 15,
  },

  filterButton: {
    backgroundColor: "#242424",
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 9,
    marginRight: 10,
  },

  activeFilter: {
    backgroundColor: "#8B5CF6",
  },

  filterText: {
    color: "#BBBBBB",
    fontSize: 13,
  },

  activeFilterText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  listContent: {
    paddingBottom: 35,
    flexGrow: 1,
  },

  emptyCard: {
    backgroundColor: "#1A1A1A",
    padding: 30,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  emptyIcon: {
    width: 65,
    height: 65,
    backgroundColor: "#2D2140",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 14,
  },

  emptyText: {
    color: "#A3A3A3",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  studentCard: {
    backgroundColor: "#1A1A1A",
    padding: 17,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  studentDetail: {
    color: "#A3A3A3",
    fontSize: 13,
    marginTop: 5,
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 10,
  },

  activeBadge: {
    backgroundColor: "#163A2A",
  },

  inactiveBadge: {
    backgroundColor: "#3A2C16",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "bold",
  },

  activeStatus: {
    color: "#4ADE80",
  },

  inactiveStatus: {
    color: "#FBBF24",
  },

  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },

  actionButton: {
    padding: 7,
    marginLeft: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: "#1C1C1C",
    borderRadius: 17,
    padding: 22,
    maxHeight: "85%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  modalTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "bold",
  },

  input: {
    backgroundColor: "#292929",
    color: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 13,
  },

  fieldLabel: {
    color: "#CCCCCC",
    fontSize: 13,
    marginBottom: 10,
  },

  modalActions: {
    flexDirection: "row",
    marginTop: 10,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#333333",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 6,
  },

  cancelText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  saveButton: {
    flex: 1,
    backgroundColor: "#8B5CF6",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 6,
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
