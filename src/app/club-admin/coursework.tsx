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

type Coursework = {
  id: number;
  title: string;
  description: string;
  language: string;
  dueDate: string;
  status: "Draft" | "Published";
};

const languages = ["Python", "Java", "JavaScript", "Web Design"];

export default function ManageCourseworkScreen() {
  const [items, setItems] = useState<Coursework[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("Python");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.language.toLowerCase().includes(search.toLowerCase());

    return matchesSearch && (filter === "All" || item.status === filter);
  });

  function resetForm() {
    setTitle("");
    setDescription("");
    setLanguage("Python");
    setDueDate("");
    setStatus("Draft");
    setEditingId(null);
  }

  function openAdd() {
    resetForm();
    setModalVisible(true);
  }

  function openEdit(item: Coursework) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setLanguage(item.language);
    setDueDate(item.dueDate);
    setStatus(item.status);
    setModalVisible(true);
  }

  function validDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  function saveCoursework() {
    if (!title.trim() || !description.trim() || !dueDate.trim()) {
      Alert.alert("Missing Information", "Please complete all fields.");
      return;
    }

    if (!validDate(dueDate.trim())) {
      Alert.alert("Invalid Date", "Enter a valid date in YYYY-MM-DD format.");
      return;
    }

    const duplicate = items.some(
      (item) =>
        item.title.toLowerCase() === title.trim().toLowerCase() &&
        item.id !== editingId
    );

    if (duplicate) {
      Alert.alert("Duplicate Title", "Coursework with this title already exists.");
      return;
    }

    if (editingId !== null) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: title.trim(),
                description: description.trim(),
                language,
                dueDate: dueDate.trim(),
                status,
              }
            : item
        )
      );
    } else {
      setItems((current) => [
        ...current,
        {
          id: Date.now(),
          title: title.trim(),
          description: description.trim(),
          language,
          dueDate: dueDate.trim(),
          status,
        },
      ]);
    }

    setModalVisible(false);
    resetForm();
  }

  function deleteCoursework(item: Coursework) {
    Alert.alert("Delete Coursework", `Delete "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setItems((current) =>
            current.filter((course) => course.id !== item.id)
          ),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/club-admin")}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Coursework</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Create and manage coding club learning activities.
        </Text>

        <Text style={styles.notice}>
          Local preview: coursework is not saved to the database.
        </Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{items.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {items.filter((item) => item.status === "Published").length}
            </Text>
            <Text style={styles.summaryLabel}>Published</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {items.filter((item) => item.status === "Draft").length}
            </Text>
            <Text style={styles.summaryLabel}>Drafts</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={openAdd}>
          <Ionicons name="add-circle-outline" size={21} color="#FFFFFF" />
                    <Text style={styles.addText}>Create Coursework</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Search coursework..."
          placeholderTextColor="#888888"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterRow}>
          {["All", "Draft", "Published"].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.filterButton,
                filter === value && styles.selectedButton,
              ]}
              onPress={() => setFilter(value)}
            >
              <Text style={styles.buttonText}>{value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="book-outline" size={38} color="#A78BFA" />
              <Text style={styles.emptyTitle}>No coursework found</Text>
              <Text style={styles.emptyText}>
                {items.length === 0
                  ? "Create your first coursework item."
                  : "Try changing your search or filter."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>

              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.detail}>Language: {item.language}</Text>
              <Text style={styles.detail}>Due: {item.dueDate}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEdit(item)}
                >
                  <Ionicons name="create-outline" size={17} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteCoursework(item)}
                >
                  <Ionicons name="trash-outline" size={17} color="#FF6B6B" />
                  <Text style={styles.deleteText}>Delete</Text>
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
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>
                {editingId === null ? "Create Coursework" : "Edit Coursework"}
              </Text>

              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Coursework title"
                placeholderTextColor="#888888"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, { minHeight: 90 }]}
                placeholder="Coursework instructions"
                placeholderTextColor="#888888"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.label}>Programming Language</Text>
              <View style={styles.languageRow}>
                {languages.map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.filterButton,
                      language === value && styles.selectedButton,
                    ]}
                    onPress={() => setLanguage(value)}
                  >
                    <Text style={styles.buttonText}>{value}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-10-23"
                placeholderTextColor="#888888"
                value={dueDate}
                onChangeText={setDueDate}
              />

              <Text style={styles.label}>Status</Text>
              <View style={styles.filterRow}>
                {(["Draft", "Published"] as const).map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.filterButton,
                      status === value && styles.selectedButton,
                    ]}
                    onPress={() => setStatus(value)}
                  >
                    <Text style={styles.buttonText}>{value}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveCoursework}
                >
                  <Text style={styles.buttonText}>Save Coursework</Text>
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
    gap: 15,
    padding: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    color: "#AAAAAA",
    fontSize: 14,
    marginBottom: 8,
  },
  notice: {
    color: "#D8B4FE",
    fontSize: 12,
    marginBottom: 18,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#211832",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
  },
  summaryLabel: {
    color: "#BBBBBB",
    fontSize: 12,
    marginTop: 5,
  },

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
  addText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#292929",
    color: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
  },

  filterRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: "#333333",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedButton: {
    backgroundColor: "#8B5CF6",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  emptyCard: {
    backgroundColor: "#1A1A1A",
    padding: 30,
    borderRadius: 13,
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
    textAlign: "center",
    fontSize: 12,
    marginTop: 9,
  },

  card: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 13,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusText: {
    color: "#A78BFA",
    fontSize: 12,
    fontWeight: "bold",
  },
  description: {
    color: "#CCCCCC",
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 13,
  },
  detail: {
    color: "#AAAAAA",
    fontSize: 12,
    marginBottom: 7,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 15,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#312047",
    padding: 12,
    borderRadius: 9,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#342020",
    padding: 12,
    borderRadius: 9,
  },
  deleteText: {
    color: "#FF6B6B",
    fontSize: 12,
    fontWeight: "bold",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#1C1C1C",
    borderRadius: 16,
    padding: 20,
    maxHeight: "88%",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    color: "#CCCCCC",
    fontSize: 13,
    marginBottom: 8,
  },
  languageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#333333",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#8B5CF6",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});