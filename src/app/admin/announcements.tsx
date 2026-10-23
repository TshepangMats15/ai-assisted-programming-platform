
import React, { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  background: "#0D0D0D",
  card: "#1A1A1A",
  input: "#292929",
  purple: "#8B5CF6",
  lightPurple: "#A78BFA",
  purpleBackground: "#2D2140",
  white: "#FFFFFF",
  secondary: "#A3A3A3",
  muted: "#888888",
  border: "#292929",
  danger: "#F87171",
};

type Audience =
  | "All Students"
  | "Java Students"
  | "Python Students"
  | "Selected Students";

type Announcement = {
  id: string;
  title: string;
  message: string;
  audience: Audience;
  date: string;
};

const audienceOptions: Audience[] = [
  "All Students",
  "Java Students",
  "Python Students",
  "Selected Students",
];

export default function AdminAnnouncementsScreen() {
  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] =
    useState<Audience>("All Students");

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/admin/adminindex");
    }
  }

  function resetForm() {
    setTitle("");
    setMessage("");
    setTargetAudience("All Students");
    setEditingId(null);
  }

  function openCreateForm() {
    resetForm();
    setIsCreating(true);
  }

  function openEditForm(item: Announcement) {
    setEditingId(item.id);
    setTitle(item.title);
    setMessage(item.message);
    setTargetAudience(item.audience);
    setIsCreating(true);
  }

  function cancelForm() {
    resetForm();
    setIsCreating(false);
  }

  function handleSave() {
    const cleanTitle = title.trim();
    const cleanMessage = message.trim();

    if (!cleanTitle || !cleanMessage) {
      Alert.alert(
        "Missing Information",
        "Please enter an announcement title and message."
      );
      return;
    }

    if (targetAudience === "Selected Students") {
      Alert.alert(
        "Select Recipients",
        "Individual student selection has not been connected yet. Please choose another audience for this local preview."
      );
      return;
    }

    if (editingId !== null) {
      setAnnouncements((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: cleanTitle,
                message: cleanMessage,
                audience: targetAudience,
              }
            : item
        )
      );

      Alert.alert(
        "Updated Locally",
        "The announcement was updated in this app session only."
      );
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title: cleanTitle,
        message: cleanMessage,
        audience: targetAudience,
        date: new Date().toLocaleDateString("en-ZA", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };

      setAnnouncements((current) => [
        newAnnouncement,
        ...current,
      ]);

      Alert.alert(
        "Saved Locally",
        "Your announcement was added to this screen. It has not been published or delivered to students."
      );
    }

    cancelForm();
  }

  function handleDelete(item: Announcement) {
    Alert.alert(
      "Delete Announcement",
      `Remove "${item.title}" from this temporary list?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setAnnouncements((current) =>
              current.filter(
                (announcement) => announcement.id !== item.id
              )
            );
          },
        },
      ]
    );
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
            color={COLORS.white}
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Announcements
          </Text>

          <Text style={styles.headerSubtitle}>
            DevMate Admin Portal
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageDescription}>
            Create and manage coding club announcements.
          </Text>

          {/* LOCAL DATA NOTICE */}
          <View style={styles.noticeCard}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={COLORS.lightPurple}
            />

            <Text style={styles.noticeText}>
              Local preview only. Announcements are not
              saved to the database or delivered to students.
            </Text>
          </View>

          {!isCreating ? (
            <>
              {/* NEW ANNOUNCEMENT BUTTON */}
              <TouchableOpacity
                style={styles.newButton}
                onPress={openCreateForm}
                accessibilityRole="button"
              >
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color={COLORS.white}
                />

                <Text style={styles.newButtonText}>
                  New Announcement
                </Text>
              </TouchableOpacity>

              {/* ANNOUNCEMENTS */}
              <Text style={styles.sectionTitle}>
                Announcements
              </Text>

              {announcements.length === 0 ? (
                <View style={styles.emptyCard}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="megaphone-outline"
                      size={31}
                      color={COLORS.lightPurple}
                    />
                  </View>

                  <Text style={styles.emptyTitle}>
                    No announcements yet
                  </Text>

                  <Text style={styles.emptyDescription}>
                    Create an announcement to preview
                    how it will appear in the Admin Portal.
                  </Text>
                </View>
              ) : (
                announcements.map((item) => (
                  <View
                    key={item.id}
                    style={styles.announcementCard}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardIcon}>
                        <Ionicons
                          name="megaphone-outline"
                          size={20}
                          color={COLORS.lightPurple}
                        />
                      </View>

                      <Text style={styles.cardTitle}>
                        {item.title}
                      </Text>
                    </View>

                    <Text style={styles.cardMessage}>
                      {item.message}
                    </Text>

                    <View style={styles.audienceBadge}>
                      <Ionicons
                        name="people-outline"
                        size={14}
                        color={COLORS.lightPurple}
                      />

                      <Text style={styles.audienceBadgeText}>
                        {item.audience}
                      </Text>
                    </View>

                    <Text style={styles.cardDate}>
                      Created: {item.date}
                    </Text>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => openEditForm(item)}
                        accessibilityRole="button"
                      >
                        <Ionicons
                          name="create-outline"
                          size={17}
                          color={COLORS.lightPurple}
                        />

                        <Text style={styles.editButtonText}>
                          Edit
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item)}
                        accessibilityRole="button"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={17}
                          color={COLORS.danger}
                        />

                        <Text style={styles.deleteButtonText}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          ) : (
            /* CREATE / EDIT FORM */
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <View style={styles.formIcon}>
                  <Ionicons
                    name={
                      editingId !== null
                        ? "create-outline"
                        : "add-outline"
                    }
                    size={23}
                    color={COLORS.lightPurple}
                  />
                </View>

                <Text style={styles.formTitle}>
                  {editingId !== null
                    ? "Edit Announcement"
                    : "Create Announcement"}
                </Text>
              </View>

              <Text style={styles.inputLabel}>
                Announcement Title
              </Text>

              <TextInput
                style={styles.textInput}
                placeholder="Enter announcement title..."
                placeholderTextColor={COLORS.muted}
                value={title}
                onChangeText={setTitle}
                maxLength={120}
              />

              <Text style={styles.inputLabel}>
                Message
              </Text>

              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Write your announcement..."
                placeholderTextColor={COLORS.muted}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
                maxLength={2000}
              />

              {/* AUDIENCE */}
              <Text style={styles.inputLabel}>
                Send To
              </Text>

              <View style={styles.audienceCard}>
                {audienceOptions.map((option, index) => (
                  <React.Fragment key={option}>
                    <TouchableOpacity
                      style={styles.radioRow}
                      onPress={() => setTargetAudience(option)}
                      accessibilityRole="radio"
                      accessibilityState={{
                        checked: targetAudience === option,
                      }}
                    >
                      <Ionicons
                        name={
                          targetAudience === option
                            ? "radio-button-on"
                            : "radio-button-off"
                        }
                        size={22}
                        color={
                          targetAudience === option
                            ? COLORS.purple
                            : COLORS.muted
                        }
                      />

                      <Text style={styles.radioText}>
                        {option}
                      </Text>
                    </TouchableOpacity>

                    {index < audienceOptions.length - 1 && (
                      <View style={styles.radioDivider} />
                    )}
                  </React.Fragment>
                ))}
              </View>

              {/* FORM BUTTONS */}
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelForm}
                  accessibilityRole="button"
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={19}
                    color={COLORS.white}
                  />

                  <Text style={styles.saveButtonText}>
                    {editingId !== null
                      ? "Save Changes"
                      : "Save Draft"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text style={styles.footerText}>
            DevMate • Announcement Management
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 45,
  },

  pageDescription: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
  },

  noticeCard: {
    backgroundColor: "#17131F",
    borderWidth: 1,
    borderColor: COLORS.purpleBackground,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  noticeText: {
    color: "#D8B4FE",
    fontSize: 12,
    lineHeight: 19,
    marginLeft: 10,
    flex: 1,
  },

  newButton: {
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },

  newButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 9,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
  },

  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    marginBottom: 25,
  },

  emptyIcon: {
    width: 65,
    height: 65,
    backgroundColor: COLORS.purpleBackground,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },

  emptyDescription: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  announcementCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.purpleBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  cardTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
    flex: 1,
  },

  cardMessage: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 15,
  },

  audienceBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.purpleBackground,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 13,
  },

  audienceBadgeText: {
    color: COLORS.lightPurple,
    fontSize: 11,
    fontWeight: "bold",
    marginLeft: 7,
  },

  cardDate: {
    color: COLORS.muted,
    fontSize: 11,
    marginBottom: 13,
  },

  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 13,
  },

  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.purpleBackground,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9,
    marginRight: 10,
  },

  editButtonText: {
    color: COLORS.lightPurple,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A2020",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9,
  },

  deleteButtonText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },

  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    marginBottom: 25,
  },

  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  formIcon: {
    width: 43,
    height: 43,
    borderRadius: 10,
    backgroundColor: COLORS.purpleBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  formTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },

  inputLabel: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },

  textInput: {
    backgroundColor: COLORS.input,
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  textArea: {
    minHeight: 125,
  },

  audienceCard: {
    backgroundColor: "#222222",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 24,
  },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },

  radioText: {
    color: COLORS.white,
    fontSize: 13,
    marginLeft: 12,
  },

  radioDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  formActions: {
    flexDirection: "row",
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#333333",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  cancelButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "bold",
  },

  saveButton: {
    flex: 1,
    backgroundColor: COLORS.purple,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  saveButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 7,
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
  },
});
