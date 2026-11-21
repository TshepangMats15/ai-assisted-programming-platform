import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
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

export default function ManageStudentsScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "All" || student.status === filter;

    return matchesSearch && matchesFilter;
  });

  function resetForm() {
    setName("");
    setEmail("");
    setCourse("");
    setStatus("Active");
    setEditingId(null);
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

  function saveStudent() {
    if (!name.trim() || !email.trim() || !course.trim()) {
      Alert.alert("Missing Information", "Please complete all fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    const duplicateEmail = students.some(
      (student) =>
        student.email.toLowerCase() === email.trim().toLowerCase() &&
        student.id !== editingId
    );

    if (duplicateEmail) {
      Alert.alert("Duplicate Email", "A student with this email already exists.");
      return;
    }

    if (editingId !== null) {
      setStudents(
        students.map((student) =>
          student.id === editingId
            ? {
                ...student,
                name: name.trim(),
                email: email.trim(),
                course: course.trim(),
                status,
              }
            : student
        )
      );
    } else {
      const newStudent: Student = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        course: course.trim(),
        status,
      };

      setStudents([...students, newStudent]);
    }

    setModalVisible(false);
    resetForm();
  }

  function deleteStudent(student: Student) {
    Alert.alert(
      "Remove Student",
      `Remove ${student.name} from this temporary list?`,
      [
        { text: "Cancel", style: "cancel" },
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/club-admin")}>
          <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Students</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Manage coding club student records.
        </Text>

        <Text style={styles.demoNotice}>
          Local preview: changes are not saved to the database.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Students in this session</Text>
          <Text style={styles.summaryValue}>{students.length}</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Student</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor="#888888"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterRow}>
          {["All", "Active", "Inactive"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterButton,
                filter === item && styles.activeFilter,
              ]}
              onPress={() => setFilter(item)}
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
          ))}
        </View>

        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={35} color="#A78BFA" />
              <Text style={styles.emptyTitle}>No students found</Text>
              <Text style={styles.emptyText}>
                {students.length === 0
                  ? "Add a student to test the management interface."
                  : "Try a different search or status filter."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentDetail}>{item.email}</Text>
                <Text style={styles.studentDetail}>{item.course}</Text>
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

              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <Ionicons name="create-outline" size={23} color="#A78BFA" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteStudent(item)}>
                  <Ionicons name="trash-outline" size={23} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId !== null ? "Edit Student" : "Add Student"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#888888"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#888888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Course (e.g. Python)"
              placeholderTextColor="#888888"
              value={course}
              onChangeText={setCourse}
            />

            <Text style={styles.fieldLabel}>Student Status</Text>

            <View style={styles.filterRow}>
              {(["Active", "Inactive"] as const).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.filterButton,
                    status === item && styles.activeFilter,
                  ]}
                  onPress={() => setStatus(item)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      status === item && styles.activeFilterText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveStudent}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 15,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 23, fontWeight: "bold" },
  content: { flex: 1, paddingHorizontal: 20 },
  subtitle: { color: "#AAAAAA", fontSize: 14, marginBottom: 12 },
  demoNotice: {
    color: "#D8B4FE",
    fontSize: 12,
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: "#211832",
    padding: 18,
    borderRadius: 13,
    marginBottom: 18,
  },
  summaryLabel: { color: "#BBBBBB", fontSize: 13 },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 6,
  },
  addButton: {
    backgroundColor: "#8B5CF6",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginBottom: 17,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  searchInput: {
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    padding: 15,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#333333",
    marginBottom: 15,
  },
  filterRow: { flexDirection: "row", gap: 10, marginBottom: 15 },
  filterButton: {
    backgroundColor: "#242424",
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 9,
  },
  activeFilter: { backgroundColor: "#8B5CF6" },
  filterText: { color: "#BBBBBB", fontSize: 13 },
  activeFilterText: { color: "#FFFFFF", fontWeight: "bold" },
  listContent: { paddingBottom: 35, flexGrow: 1 },
  emptyCard: {
    backgroundColor: "#1A1A1A",
    padding: 30,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 14,
  },
  emptyText: {
    color: "#AAAAAA",
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
  studentInfo: { flex: 1 },
  studentName: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  studentDetail: { color: "#AAAAAA", fontSize: 13, marginTop: 5 },
  statusText: { fontSize: 12, marginTop: 9, fontWeight: "bold" },
  activeStatus: { color: "#34D399" },
  inactiveStatus: { color: "#FBBF24" },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginLeft: 10,
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
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#292929",
    color: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 13,
  },
  fieldLabel: { color: "#CCCCCC", fontSize: 13, marginBottom: 10 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 10 },
  cancelButton: {
    flex: 1,
    backgroundColor: "#333333",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: { color: "#FFFFFF", fontWeight: "bold" },
  saveButton: {
    flex: 1,
    backgroundColor: "#8B5CF6",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "#FFFFFF", fontWeight: "bold" },
});
