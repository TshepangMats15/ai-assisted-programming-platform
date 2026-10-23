import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [remindersEnabled, setRemindersEnabled] =
    useState(true);

  // Send password reset email
  const handlePasswordReset = async () => {
    const email = auth.currentUser?.email;

    if (!email) {
      Alert.alert("Error", "No signed-in email was found.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      Alert.alert(
        "Request Sent",
        "If this account is eligible, password reset instructions will be sent to your email."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Unable to process the password reset request."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Manage your DevMate preferences.
        </Text>

        {/* NOTIFICATION SETTINGS */}

        <Text style={styles.sectionTitle}>
          Notifications
        </Text>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>
                Enable Notifications
              </Text>

              <Text style={styles.settingDescription}>
                Your preference for app notifications.
              </Text>
            </View>

            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: "#444444",
                true: "#8B5CF6",
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>
                Assessment Reminders
              </Text>

              <Text style={styles.settingDescription}>
                Your preference for assessment reminders.
              </Text>
            </View>

            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{
                false: "#444444",
                true: "#8B5CF6",
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ACCOUNT SETTINGS */}

        <Text style={styles.sectionTitle}>
          Account
        </Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/profile")}
        >
          <Text style={styles.actionText}>
            My Profile
          </Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handlePasswordReset}
        >
          <Text style={styles.actionText}>
            Reset Password
          </Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* APPLICATION INFORMATION */}

        <Text style={styles.sectionTitle}>
          About DevMate
        </Text>

        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>
            DevMate Student Platform
          </Text>

          <Text style={styles.aboutText}>
            An AI-assisted programming learning platform
            designed to help students improve their coding
            skills through coursework, assessments and
            learning support.
          </Text>

          <Text style={styles.versionText}>
            Frontend Development Version
          </Text>
        </View>

        <Text style={styles.note}>
          Notification preferences are currently local demo
          settings and do not yet schedule notifications.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  backText: {
    color: "#8B5CF6",
    fontSize: 16,
    marginBottom: 25,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#A3A3A3",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },
  settingsCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 18,
    marginBottom: 25,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 15,
  },
  settingTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  settingDescription: {
    color: "#888888",
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#333333",
    marginVertical: 10,
  },
  actionCard: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  arrow: {
    color: "#8B5CF6",
    fontSize: 25,
  },
  aboutCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  aboutTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
  },
  aboutText: {
    color: "#A3A3A3",
    fontSize: 13,
    lineHeight: 21,
  },
  versionText: {
    color: "#8B5CF6",
    fontSize: 12,
    marginTop: 20,
  },
  note: {
    color: "#777777",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
  },
});