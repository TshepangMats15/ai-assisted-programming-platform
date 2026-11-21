
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";

import { useEffect } from "react";
import { auth } from "../../services/firebase";
import { useAppTheme } from "../../context/ThemeContext";

export default function ProfileScreen() {
  // Theme
  const { isDark, colors } = useAppTheme();

  // Firebase student
  const [user, setUser] = useState<User | null>(
    auth.currentUser
  );

  // Profile editing
  const [editVisible, setEditVisible] = useState(false);
  const [fullName, setFullName] = useState(
    auth.currentUser?.displayName || ""
  );

  // Selected image is a local preview, not an upload
  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Keep profile synchronized with Firebase authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setFullName(currentUser?.displayName || "");
      setSelectedImage(null);
    });

    return unsubscribe;
  }, []);

  // Colours
  const background = colors.background;
  const cardBackground = isDark ? "#1A1A1A" : "#FFFFFF";
  const primaryText = isDark ? "#FFFFFF" : "#171717";
  const secondaryText = isDark ? "#A3A3A3" : "#666666";
  const borderColor = isDark ? "#292929" : "#E5E7EB";
  const inputBackground = isDark ? "#252525" : "#F5F5F5";
  const purple = "#8B5CF6";

  const displayName = user?.displayName?.trim() || "Name not set";
  const email = user?.email || "No email available";

  const initials = user?.displayName?.trim()
    ? user.displayName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
    : "?";

  // Save a real full name to Firebase Authentication
  const handleSaveName = async () => {
    const name = fullName.trim();

    if (!name) {
      Alert.alert("Required", "Please enter your full name.");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "No signed-in student was found.");
      return;
    }

    try {
      setSaving(true);

      await updateProfile(auth.currentUser, {
        displayName: name,
      });

      // Refresh local profile state
      setUser({ ...auth.currentUser } as User);
      setEditVisible(false);

      Alert.alert(
        "Profile Updated",
        "Your name has been saved to your Firebase account."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Unable to save your name. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Select a profile photo from the device
  const handleChoosePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos to select a profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);

        Alert.alert(
          "Photo Selected",
          "Your photo is shown as a preview on this device. Permanent profile photo storage is not connected yet."
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Unable to select a profile picture."
      );
    }
  };

  // Remove the selected local photo
  const handleRemovePhoto = () => {
    if (!selectedImage) {
      Alert.alert(
        "No Local Photo",
        "There is no selected photo preview to remove."
      );
      return;
    }

    setSelectedImage(null);
  };

  // Firebase logout
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of DevMate?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              setLoggingOut(true);
              await signOut(auth);
              router.replace("/");
            } catch (error) {
              Alert.alert(
                "Logout Failed",
                "Unable to log out. Please try again."
              );
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <Text
          style={[
            styles.headerTitle,
            { color: primaryText },
          ]}
        >
          My Profile
        </Text>

        <Text
          style={[
            styles.headerSubtitle,
            { color: secondaryText },
          ]}
        >
          Manage your DevMate student account.
        </Text>

        {/* PROFILE CARD */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
        >
          <View style={styles.avatarContainer}>
            {selectedImage || user?.photoURL ? (
              <Image
                source={{
                  uri: selectedImage || user?.photoURL || "",
                }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {initials}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleChoosePhoto}
              accessibilityLabel="Choose profile picture"
            >
              <Ionicons
                name="camera-outline"
                size={19}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.name,
              { color: primaryText },
            ]}
          >
            {displayName}
          </Text>

          <Text
            style={[
              styles.email,
              { color: secondaryText },
            ]}
          >
            {email}
          </Text>

          <View style={styles.studentBadge}>
            <Text style={styles.studentBadgeText}>
              DevMate Student
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setFullName(user?.displayName || "");
              setEditVisible(true);
            }}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.editButtonText}>
              Edit Full Name
            </Text>
          </TouchableOpacity>

          <View style={styles.photoActions}>
            <TouchableOpacity
              style={[
                styles.photoAction,
                { borderColor },
              ]}
              onPress={handleChoosePhoto}
            >
              <Ionicons
                name="image-outline"
                size={17}
                color={purple}
              />
              <Text style={styles.photoActionText}>
                Choose Photo
              </Text>
            </TouchableOpacity>

            {selectedImage && (
              <TouchableOpacity
                style={[
                  styles.photoAction,
                  { borderColor },
                ]}
                onPress={handleRemovePhoto}
              >
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color="#DC2626"
                />
                <Text style={styles.removePhotoText}>
                  Remove
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text
            style={[
              styles.photoNote,
              { color: secondaryText },
            ]}
          >
            Selected photos are previews only.
            Permanent photo uploads will be enabled
            when secure storage is connected.
          </Text>
        </View>

        {/* ACCOUNT INFORMATION */}
        <Text
          style={[
            styles.sectionTitle,
            { color: primaryText },
          ]}
        >
          Account Information
        </Text>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
        >
          <Text
            style={[
              styles.infoLabel,
              { color: secondaryText },
            ]}
          >
            Full Name
          </Text>

          <Text
            style={[
              styles.infoValue,
              { color: primaryText },
            ]}
          >
            {displayName}
          </Text>

          <View
            style={[
              styles.divider,
              { backgroundColor: borderColor },
            ]}
          />

          <Text
            style={[
              styles.infoLabel,
              { color: secondaryText },
            ]}
          >
            Email Address
          </Text>

          <Text
            style={[
              styles.infoValue,
              { color: primaryText },
            ]}
          >
            {email}
          </Text>

          <View
            style={[
              styles.divider,
              { backgroundColor: borderColor },
            ]}
          />

          <Text
            style={[
              styles.infoLabel,
              { color: secondaryText },
            ]}
          >
            Firebase Account
          </Text>

          <Text style={styles.activeStatus}>
            {user ? "Signed In" : "Not Signed In"}
          </Text>
        </View>

        {/* MY DEVMATE */}
        <Text
          style={[
            styles.sectionTitle,
            { color: primaryText },
          ]}
        >
          My DevMate
        </Text>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
          onPress={() => router.push("/progress")}
        >
          <Ionicons
            name="stats-chart-outline"
            size={22}
            color={purple}
          />

          <Text
            style={[
              styles.menuText,
              { color: primaryText },
            ]}
          >
            My Learning Progress
          </Text>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={purple}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
          onPress={() => router.push("/notifications")}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={purple}
          />

          <Text
            style={[
              styles.menuText,
              { color: primaryText },
            ]}
          >
            Notifications
          </Text>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={purple}
          />
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.logoutText}>
                Log Out
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text
          style={[
            styles.footer,
            { color: secondaryText },
          ]}
        >
          DevMate — AI-Assisted Programming Platform
        </Text>
      </ScrollView>

      {/* EDIT NAME MODAL */}
      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: cardBackground },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: primaryText },
              ]}
            >
              Edit Full Name
            </Text>

            <Text
              style={[
                styles.modalDescription,
                { color: secondaryText },
              ]}
            >
              Enter the name you want displayed
              on your DevMate account.
            </Text>

            <TextInput
              style={[
                styles.nameInput,
                {
                  backgroundColor: inputBackground,
                  color: primaryText,
                  borderColor,
                },
              ]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={secondaryText}
              autoCapitalize="words"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { borderColor },
                ]}
                onPress={() => setEditVisible(false)}
                disabled={saving}
              >
                <Text
                  style={[
                    styles.cancelText,
                    { color: primaryText },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveName}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveText}>
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },

  headerSubtitle: {
    fontSize: 14,
    marginTop: 7,
    marginBottom: 25,
  },

  profileCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    marginBottom: 25,
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },

  avatar: {
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarImage: {
    width: 95,
    height: 95,
    borderRadius: 48,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
  },

  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  name: {
    fontSize: 23,
    fontWeight: "bold",
    textAlign: "center",
  },

  email: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },

  studentBadge: {
    marginTop: 15,
    backgroundColor: "#2D2140",
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
  },

  studentBadgeText: {
    color: "#C4B5FD",
    fontWeight: "600",
  },

  editButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  photoActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  photoAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  photoActionText: {
    color: "#8B5CF6",
    fontSize: 12,
    fontWeight: "600",
  },

  removePhotoText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },

  photoNote: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  infoCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    marginBottom: 25,
  },

  infoLabel: {
    fontSize: 13,
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },

  activeStatus: {
    fontSize: 15,
    color: "#16A34A",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    marginVertical: 15,
  },

  menuItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 17,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },

  logoutButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 15,
  },

  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 25,
  },

  // EDIT NAME MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 25,
  },

  modalCard: {
    borderRadius: 18,
    padding: 22,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "bold",
  },

  modalDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 18,
  },

  nameInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },

  cancelText: {
    fontWeight: "600",
  },

  saveButton: {
    flex: 1,
    backgroundColor: "#8B5CF6",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
