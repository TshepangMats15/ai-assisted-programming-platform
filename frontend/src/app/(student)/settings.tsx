
import React, { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useAppTheme } from "../../context/ThemeContext";

export default function SettingsScreen() {
  // Get the current DevMate theme
  const { isDark, toggleTheme, colors } = useAppTheme();

  // Loading state for password reset
  const [resetLoading, setResetLoading] = useState(false);

  // Theme colours
  const background = colors.background;
  const cardBackground = isDark ? "#1A1A1A" : "#FFFFFF";
  const primaryText = isDark ? "#FFFFFF" : "#171717";
  const secondaryText = isDark ? "#A3A3A3" : "#666666";
  const borderColor = isDark ? "#292929" : "#E5E7EB";
  const purple = "#8B5CF6";

  // Send password reset email using Firebase
  const handlePasswordReset = async () => {
    const email = auth.currentUser?.email;

    if (!email) {
      Alert.alert(
        "Error",
        "No signed-in student email was found."
      );
      return;
    }

    try {
      setResetLoading(true);

      await sendPasswordResetEmail(auth, email);

      Alert.alert(
        "Request Sent",
        "If this account is eligible, password reset instructions will be sent to your email."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Unable to process the password reset request. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  };

  // Explain privacy features that need backend support
  const handlePrivacyInformation = () => {
    Alert.alert(
      "Student Data and Privacy",
      "DevMate will provide controls to access, download and delete your collected personal data, as well as request account deletion. These features require secure backend integration and are not yet available."
    );
  };

  return (
    <SafeAreaView
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
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: primaryText },
            ]}
          >
            Settings
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: secondaryText },
            ]}
          >
            Manage your DevMate preferences and account.
          </Text>
        </View>

        {/* APPEARANCE */}
        <Text
          style={[
            styles.sectionTitle,
            { color: primaryText },
          ]}
        >
          Appearance
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
        >
          <View style={styles.settingRow}>
            <View style={styles.rowIcon}>
              <Ionicons
                name={isDark ? "moon-outline" : "sunny-outline"}
                size={22}
                color={purple}
              />
            </View>

            <View style={styles.settingInfo}>
              <Text
                style={[
                  styles.settingTitle,
                  { color: primaryText },
                ]}
              >
                Dark Mode
              </Text>

              <Text
                style={[
                  styles.settingDescription,
                  { color: secondaryText },
                ]}
              >
                {isDark
                  ? "Dark appearance is enabled."
                  : "Light appearance is enabled."}
              </Text>
            </View>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: "#CCCCCC",
                true: purple,
              }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Toggle dark mode"
            />
          </View>
        </View>

        {/* ACCOUNT */}
        <Text
          style={[
            styles.sectionTitle,
            { color: primaryText },
          ]}
        >
          Account
        </Text>

        <TouchableOpacity
          style={[
            styles.card,
            styles.actionRow,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
          onPress={() => router.push("/profile")}
        >
          <View style={styles.rowIcon}>
            <Ionicons
              name="person-outline"
              size={22}
              color={purple}
            />
          </View>

          <View style={styles.settingInfo}>
            <Text
              style={[
                styles.settingTitle,
                { color: primaryText },
              ]}
            >
              My Profile
            </Text>

            <Text
              style={[
                styles.settingDescription,
                { color: secondaryText },
              ]}
            >
              View your student account information.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={purple}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            styles.actionRow,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
          onPress={handlePasswordReset}
          disabled={resetLoading}
        >
          <View style={styles.rowIcon}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color={purple}
            />
          </View>

          <View style={styles.settingInfo}>
            <Text
              style={[
                styles.settingTitle,
                { color: primaryText },
              ]}
            >
              Reset Password
            </Text>

            <Text
              style={[
                styles.settingDescription,
                { color: secondaryText },
              ]}
            >
              Receive password reset instructions by email.
            </Text>
          </View>

          {resetLoading ? (
            <ActivityIndicator color={purple} />
          ) : (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={purple}
            />
          )}
        </TouchableOpacity>

        {/* PRIVACY */}
        <Text
          style={[
            styles.sectionTitle,
            { color: primaryText },
          ]}
        >
          Privacy and Data
        </Text>

        <TouchableOpacity
          style={[
            styles.card,
            styles.actionRow,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
          onPress={handlePrivacyInformation}
        >
          <View style={styles.rowIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={purple}
            />
          </View>

          <View style={styles.settingInfo}>
            <Text
              style={[
                styles.settingTitle,
                { color: primaryText },
              ]}
            >
              Manage My Data
            </Text>

            <Text
              style={[
                styles.settingDescription,
                { color: secondaryText },
              ]}
            >
              Data access, export and deletion.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={purple}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.privacyNote,
            { color: secondaryText },
          ]}
        >
          Data export and deletion are not yet available.
          Secure backend integration is required before
          these controls can process student information.
        </Text>

        {/* ABOUT DEVMATE */}
        <Text
          style={[
            styles.sectionTitle,
            { color: primaryText },
          ]}
        >
          About DevMate
        </Text>

        <View
          style={[
            styles.card,
            styles.aboutCard,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
        >
          <View style={styles.aboutHeader}>
            <Ionicons
              name="code-slash-outline"
              size={25}
              color={purple}
            />

            <Text
              style={[
                styles.aboutTitle,
                { color: primaryText },
              ]}
            >
              DevMate Student Platform
            </Text>
          </View>

          <Text
            style={[
              styles.aboutDescription,
              { color: secondaryText },
            ]}
          >
            An AI-assisted programming learning platform
            designed to support students through coursework,
            assessments, coding practice and guided learning.
          </Text>

          <Text style={styles.versionText}>
            Frontend Development Version
          </Text>
        </View>

        {/* NOTIFICATION INFORMATION */}
        <View style={styles.informationRow}>
          <Ionicons
            name="information-circle-outline"
            size={19}
            color={secondaryText}
          />

          <Text
            style={[
              styles.informationText,
              { color: secondaryText },
            ]}
          >
            Notification preferences will be added when
            DevMate supports actual notification delivery.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// SETTINGS SCREEN STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // HEADER
  header: {
    marginTop: 15,
    marginBottom: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 7,
    lineHeight: 20,
  },

  // SECTIONS
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 14,
  },

  // CARDS
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 17,
    marginBottom: 12,
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#2D2140",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  settingInfo: {
    flex: 1,
    paddingRight: 8,
  },

  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  settingDescription: {
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },

  // PRIVACY
  privacyNote: {
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 15,
    marginTop: 2,
  },

  // ABOUT
  aboutCard: {
    padding: 20,
  },

  aboutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  aboutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },

  aboutDescription: {
    fontSize: 13,
    lineHeight: 21,
  },

  versionText: {
    color: "#8B5CF6",
    fontSize: 12,
    marginTop: 18,
  },

  // INFORMATION
  informationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 15,
    gap: 8,
  },

  informationText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
  },
});
