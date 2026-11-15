
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

  // Added: policy and About Us expansion states
  const [privacyExpanded, setPrivacyExpanded] = useState(false);
  const [securityExpanded, setSecurityExpanded] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);

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

        {/* PRIVACY POLICY - ADDED */}

        <Text style={styles.sectionTitle}>
          Privacy Policy
        </Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setPrivacyExpanded(!privacyExpanded)}
        >
          <Text style={styles.actionText}>
            View Privacy Policy
          </Text>
          <Text style={styles.arrow}>
            {privacyExpanded ? "⌄" : "›"}
          </Text>
        </TouchableOpacity>

        {privacyExpanded && (
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>
              DevMate Privacy Policy
            </Text>

            <Text style={styles.versionText}>
              Effective Date: 12 November 2026
            </Text>

            <Text style={styles.aboutText}>
              {"\n"}1. Introduction{"\n"}
              DevMate is an AI-assisted programming learning
              platform. This policy explains how information
              is collected, used and handled when users
              access the platform.
              {"\n\n"}2. Information We Collect{"\n"}
              Depending on the features used, DevMate may
              process names, email addresses, user roles,
              coursework, assessments, submissions,
              learning progress, AI prompts and usage data.
              {"\n\n"}3. How We Use Information{"\n"}
              Information is used to provide learning
              features, authenticate users, manage accounts,
              support AI functionality, display analytics
              and maintain the platform.
              {"\n\n"}4. Third-Party Services{"\n"}
              DevMate uses Firebase Authentication and
              cloud-hosted backend services. AI prompts may
              be transmitted to an AI service to generate
              responses.
              {"\n\n"}5. Data Protection{"\n"}
              DevMate aims to protect user information
              through appropriate authentication,
              access controls and secure communication.
              No online service can guarantee absolute
              security.
              {"\n\n"}6. Data Retention{"\n"}
              Information may be retained as necessary
              to provide services and meet applicable
              operational or legal requirements.
              Specific retention and deletion procedures
              will be communicated when established.
              {"\n\n"}7. User Rights{"\n"}
              Subject to applicable law, users may request
              access to, correction of, or deletion of
              their personal information.
              {"\n\n"}8. Policy Updates{"\n"}
              DevMate may update this policy as its
              features or data practices change.
            </Text>
          </View>
        )}

        {/* SECURITY POLICY - ADDED */}

        <Text style={styles.sectionTitle}>
          Security Policy
        </Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setSecurityExpanded(!securityExpanded)}
        >
          <Text style={styles.actionText}>
            View Security Policy
          </Text>
          <Text style={styles.arrow}>
            {securityExpanded ? "⌄" : "›"}
          </Text>
        </TouchableOpacity>

        {securityExpanded && (
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>
              DevMate Security Policy
            </Text>

            <Text style={styles.versionText}>
              Effective Date: 12 November 2026
            </Text>

            <Text style={styles.aboutText}>
              {"\n"}1. Security Commitment{"\n"}
              DevMate aims to protect user accounts,
              academic information and platform resources.
              {"\n\n"}2. Authentication{"\n"}
              DevMate uses Firebase Authentication to
              support user sign-in and account management.
              {"\n\n"}3. Access Control{"\n"}
              DevMate supports different user roles,
              including students and administrators.
              Sensitive operations should be restricted
              through verified backend permissions.
              {"\n\n"}4. Data Protection{"\n"}
              DevMate aims to use secure communication,
              appropriate access controls and protected
              management of service credentials.
              {"\n\n"}5. AI Safety{"\n"}
              Users should not enter passwords, private
              API keys or other confidential information
              into AI prompts. AI-generated code should
              be reviewed before use.
              {"\n\n"}6. User Responsibilities{"\n"}
              Users should protect their credentials,
              avoid sharing access tokens and report
              suspicious account activity.
              {"\n\n"}7. Security Reporting{"\n"}
              Suspected security vulnerabilities should
              be reported responsibly to the DevMate
              project team.
              {"\n\n"}8. Security Updates{"\n"}
              DevMate may update this policy as new
              security measures and platform features
              are introduced.
            </Text>
          </View>
        )}

        {/* ABOUT US - ADDED */}

        <Text style={styles.sectionTitle}>
          About Us
        </Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setAboutExpanded(!aboutExpanded)}
        >
          <Text style={styles.actionText}>
            Learn More About DevMate
          </Text>
          <Text style={styles.arrow}>
            {aboutExpanded ? "⌄" : "›"}
          </Text>
        </TouchableOpacity>

        {aboutExpanded && (
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>
              About DevMate
            </Text>

            <Text style={styles.versionText}>
              Updated: 12 November 2026
            </Text>

            <Text style={styles.aboutText}>
              {"\n"}DevMate is an AI-assisted programming
              and academic productivity platform designed
              to support students in learning and improving
              their programming skills.
              {"\n\n"}Our Mission{"\n"}
              To make programming education more accessible,
              structured and engaging through practical
              learning tools and responsible AI assistance.
              {"\n\n"}Our Vision{"\n"}
              To help students become confident,
              independent problem-solvers and capable
              software developers.
              {"\n\n"}Our Features{"\n"}
              • AI-assisted programming support{"\n"}
              • Coursework management{"\n"}
              • Assessments and submissions{"\n"}
              • Learning progress and analytics{"\n"}
              • Administrative learning tools
              {"\n\n"}Our Technology{"\n"}
              DevMate uses Expo and React Native for
              the frontend, Java Spring Boot for the
              backend, Firebase Authentication and
              cloud-hosted services.
              {"\n\n"}Our Commitment{"\n"}
              We aim to provide a student-focused
              learning environment that encourages
              academic growth and practical programming
              skills.
            </Text>
          </View>
        )}

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
