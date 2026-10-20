import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Result = {
  id: number;
  studentName: string;
  studentEmail: string;
  assessmentTitle: string;
  marksObtained: number;
  totalMarks: number;
  feedback: string;
};

export default function StudentResultsScreen() {
  const [results, setResults] = useState<Result[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [marksObtained, setMarksObtained] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  const passMark = 50;

  function getPercentage(result: Result) {
    return (result.marksObtained / result.totalMarks) * 100;
  }

  function getAverage() {
    if (results.length === 0) return 0;

    const total = results.reduce(
      (sum, result) => sum + getPercentage(result),
      0
    );

    return total / results.length;
  }

  const filteredResults = results.filter((result) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      result.studentName.toLowerCase().includes(searchText) ||
      result.studentEmail.toLowerCase().includes(searchText) ||
      result.assessmentTitle.toLowerCase().includes(searchText);

    const percentage = getPercentage(result);

    const matchesFilter =
      filter === "All" ||
      (filter === "Passed" && percentage >= passMark) ||
      (filter === "Failed" && percentage < passMark);

    return matchesSearch && matchesFilter;
  });

  function resetForm() {
    setStudentName("");
    setStudentEmail("");
    setAssessmentTitle("");
    setMarksObtained("");
    setTotalMarks("");
    setFeedback("");
    setEditingId(null);
  }

  function openAddModal() {
    resetForm();
    setModalVisible(true);
  }

  function openEditModal(result: Result) {
    setEditingId(result.id);
    setStudentName(result.studentName);
    setStudentEmail(result.studentEmail);
    setAssessmentTitle(result.assessmentTitle);
    setMarksObtained(String(result.marksObtained));
    setTotalMarks(String(result.totalMarks));
    setFeedback(result.feedback);
    setModalVisible(true);
  }

  function saveResult() {
    if (
      !studentName.trim() ||
      !studentEmail.trim() ||
      !assessmentTitle.trim() ||
      !marksObtained.trim() ||
      !totalMarks.trim()
    ) {
      Alert.alert("Missing Information", "Please complete all required fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(studentEmail.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid student email.");
      return;
    }

    const obtained = Number(marksObtained);
    const total = Number(totalMarks);

    if (
      !Number.isFinite(obtained) ||
      !Number.isFinite(total) ||
      obtained < 0 ||
      total <= 0 ||
      obtained > total
    ) {
      Alert.alert(
        "Invalid Marks",
        "Marks must be valid numbers between 0 and the total marks."
      );
      return;
    }

    const duplicate = results.some(
      (result) =>
        result.studentEmail.toLowerCase() ===
          studentEmail.trim().toLowerCase() &&
        result.assessmentTitle.toLowerCase() ===
          assessmentTitle.trim().toLowerCase() &&
        result.id !== editingId
    );

    if (duplicate) {
      Alert.alert(
        "Duplicate Result",
        "A result already exists for this student and assessment."
      );
      return;
    }

    if (editingId !== null) {
      setResults((current) =>
        current.map((result) =>
          result.id === editingId
            ? {
                ...result,
                studentName: studentName.trim(),
                studentEmail: studentEmail.trim(),
                assessmentTitle: assessmentTitle.trim(),
                marksObtained: obtained,
                totalMarks: total,
                feedback: feedback.trim(),
              }
            : result
        )
      );
    } else {
      const newResult: Result = {
        id: Date.now(),
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim(),
        assessmentTitle: assessmentTitle.trim(),
        marksObtained: obtained,
        totalMarks: total,
        feedback: feedback.trim(),
      };

      setResults((current) => [...current, newResult]);
    }

    setModalVisible(false);
    resetForm();
  }

  function deleteResult(result: Result) {
    Alert.alert(
      "Delete Result",
      `Delete the result for ${result.studentName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setResults((current) =>
              current.filter((item) => item.id !== result.id)
            );
          },
        },
      ]
    );
  }

  function renderResult({ item }: { item: Result }) {
    const percentage = getPercentage(item);
    const passed = percentage >= passMark;

    return (
      <View style={styles.resultCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.studentName}>{item.studentName}</Text>

          <Text
            style={[
              styles.statusBadge,
              passed ? styles.passedBadge : styles.failedBadge,
            ]}
          >
            {passed ? "PASSED" : "FAILED"}
          </Text>
        </View>

        <Text style={styles.studentEmail}>{item.studentEmail}</Text>

        <View style={styles.assessmentBox}>
          <Text style={styles.assessmentLabel}>Assessment</Text>
          <Text style={styles.assessmentTitle}>{item.assessmentTitle}</Text>
        </View>

        <View style={styles.marksRow}>
          <View>
            <Text style={styles.smallLabel}>Marks</Text>
            <Text style={styles.marksText}>
              {item.marksObtained} / {item.totalMarks}
            </Text>
          </View>

          <View style={styles.percentageBox}>
            <Text style={styles.smallLabel}>Percentage</Text>
            <Text
              style={[
                styles.percentageText,
                { color: passed ? "#34D399" : "#FF6B6B" },
              ]}
            >
              {percentage.toFixed(1)}%
            </Text>
          </View>
        </View>

        {item.feedback ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.smallLabel}>Admin Feedback</Text>
            <Text style={styles.feedbackText}>{item.feedback}</Text>
          </View>
        ) : null}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteResult(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/club-admin")}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Student Results</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          View and manage student assessment performance.
        </Text>

        <Text style={styles.notice}>
          Local preview: results are temporary and are not linked to registered students.
        </Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{results.length}</Text>
            <Text style={styles.summaryLabel}>Results</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {getAverage().toFixed(1)}%
            </Text>
            <Text style={styles.summaryLabel}>Average</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {results.filter((item) => getPercentage(item) >= passMark).length}
            </Text>
            <Text style={styles.summaryLabel}>Passed</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Record Student Result</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.searchInput}
          placeholder="Search student or assessment..."
          placeholderTextColor="#888888"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterRow}>
          {["All", "Passed", "Failed"].map((item) => (
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
          data={filteredResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderResult}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons
                name="school-outline"
                size={40}
                color="#A78BFA"
              />

              <Text style={styles.emptyTitle}>No results found</Text>

              <Text style={styles.emptyText}>
                {results.length === 0
                  ? "No assessment results have been recorded in this preview."
                  : "Try changing your search or result filter."}
              </Text>
            </View>
          }
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
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>
                {editingId !== null ? "Edit Student Result" : "Record Student Result"}
              </Text>

              <Text style={styles.fieldLabel}>Student Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Student full name"
                placeholderTextColor="#888888"
                value={studentName}
                onChangeText={setStudentName}
              />

              <Text style={styles.fieldLabel}>Student Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="student@example.com"
                placeholderTextColor="#888888"
                value={studentEmail}
                onChangeText={setStudentEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>Assessment Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Python Assessment 02"
                placeholderTextColor="#888888"
                value={assessmentTitle}
                onChangeText={setAssessmentTitle}
              />

              <Text style={styles.fieldLabel}>Marks Obtained *</Text>
              <TextInput
                style={styles.input}
                placeholder="75"
                placeholderTextColor="#888888"
                value={marksObtained}
                onChangeText={setMarksObtained}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Total Marks *</Text>
              <TextInput
                style={styles.input}
                placeholder="100"
                placeholderTextColor="#888888"
                value={totalMarks}
                onChangeText={setTotalMarks}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Feedback (Optional)</Text>
              <TextInput
                style={[styles.input, styles.feedbackInput]}
                placeholder="Write feedback for the student..."
                placeholderTextColor="#888888"
                value={feedback}
                onChangeText={setFeedback}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.helperText}>
                Pass mark: 50%. Percentage and result status are calculated automatically.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveResult}
                >
                  <Text style={styles.saveText}>Save Result</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  content: { flex: 1, paddingHorizontal: 20 },
  subtitle: { color: "#AAAAAA", fontSize: 14, marginBottom: 10 },
  notice: { color: "#D8B4FE", fontSize: 12, marginBottom: 18 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#211832",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
  },
  summaryLabel: { color: "#BBBBBB", fontSize: 12, marginTop: 5 },
  addButton: {
    backgroundColor: "#8B5CF6",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  searchInput: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 11,
    color: "#FFFFFF",
    padding: 14,
    marginBottom: 15,
  },
  filterRow: { flexDirection: "row", marginBottom: 17 },
  filterButton: {
    backgroundColor: "#242424",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9,
    marginRight: 9,
  },
  activeFilter: { backgroundColor: "#8B5CF6" },
  filterText: { color: "#BBBBBB", fontSize: 12 },
  activeFilterText: { color: "#FFFFFF", fontWeight: "bold" },
  listContent: { flexGrow: 1, paddingBottom: 35 },
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
    marginTop: 15,
  },
  emptyText: {
    color: "#AAAAAA",
    fontSize: 13,
    textAlign: "center",
    marginTop: 9,
    lineHeight: 20,
  },
  resultCard: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 13,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#303030",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  studentName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  studentEmail: {
    color: "#AAAAAA",
    fontSize: 12,
    marginTop: 6,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
    overflow: "hidden",
  },
  passedBadge: { color: "#34D399", backgroundColor: "#16382C" },
  failedBadge: { color: "#FF6B6B", backgroundColor: "#401C1C" },
  assessmentBox: {
    backgroundColor: "#242424",
    padding: 12,
    borderRadius: 9,
    marginTop: 15,
    marginBottom: 15,
  },
  assessmentLabel: {
    color: "#AAAAAA",
    fontSize: 11,
    marginBottom: 5,
  },
  assessmentTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  marksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  smallLabel: {
    color: "#AAAAAA",
    fontSize: 11,
    marginBottom: 6,
  },
  marksText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  percentageBox: { alignItems: "flex-end" },
  percentageText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  feedbackBox: {
    backgroundColor: "#242424",
    borderRadius: 9,
    padding: 12,
    marginBottom: 10,
  },
  feedbackText: {
    color: "#DDDDDD",
    fontSize: 12,
    lineHeight: 19,
  },
  cardActions: { flexDirection: "row", gap: 12, marginTop: 13 },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#312047",
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 9,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#342020",
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 9,
  },
  actionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "bold" },
  deleteText: { color: "#FF6B6B", fontSize: 13, fontWeight: "bold" },
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
    maxHeight: "88%",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 20,
  },
  fieldLabel: { color: "#CCCCCC", fontSize: 13, marginBottom: 9 },
  input: {
    backgroundColor: "#292929",
    color: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
  },
  feedbackInput: { minHeight: 90 },
  helperText: {
    color: "#A78BFA",
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 12,
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 12 },
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
