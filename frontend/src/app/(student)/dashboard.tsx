
import React from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "../../services/firebase";
import { useAppTheme } from "../../context/ThemeContext";

export default function DashboardScreen() {
  // Get the currently selected app theme
  const { isDark, colors } = useAppTheme();

  // Get the currently logged-in Firebase student
  const student = auth.currentUser;

  // Use the student's real display name when available
  const studentName = student?.displayName?.trim() || "Student";
  const firstName = studentName.split(" ")[0];
  const profileLetter = firstName.charAt(0).toUpperCase();

  // Dashboard colours for both themes
  const background = colors.background;
  const cardBackground = isDark ? "#1A1A1A" : "#FFFFFF";
  const primaryText = isDark ? "#FFFFFF" : "#171717";
  const secondaryText = isDark ? "#A3A3A3" : "#666666";
  const borderColor = isDark ? "#292929" : "#E5E7EB";
  const purple = "#8B5CF6";

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* STUDENT HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() => router.push("/profile")}
          >
            <View style={styles.profileCircle}>
              <Text style={styles.profileLetter}>
                {profileLetter}
              </Text>
            </View>

            <View style={styles.greetingContainer}>
              <Text
                style={[styles.greeting, { color: primaryText }]}
                numberOfLines={1}
              >
                Hi, {firstName}
              </Text>

              <Text
                style={[
                  styles.subGreeting,
                  { color: secondaryText },
                ]}
              >
                Let's start learning...
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: cardBackground },
            ]}
            onPress={() => router.push("/notifications")}
            accessibilityLabel="Open notifications"
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={purple}
            />
          </TouchableOpacity>
        </View>

        {/* ANNOUNCEMENTS */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: primaryText },
            ]}
          >
            Announcements
          </Text>
        </View>

        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
        >
          <Ionicons
            name="megaphone-outline"
            size={28}
            color={purple}
          />

          <Text
            style={[
              styles.emptyTitle,
              { color: primaryText },
            ]}
          >
            No announcements available
          </Text>

          <Text
            style={[
              styles.emptyDescription,
              { color: secondaryText },
            ]}
          >
            Announcements from your learning platform
            will appear here once connected.
          </Text>
        </View>

        {/* MY PROGRESS */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: primaryText },
            ]}
          >
            My Progress
          </Text>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => router.push("/progress")}
          >
            <Text style={styles.detailsText}>
              Details
            </Text>

            <Ionicons
              name="chevron-forward"
              size={15}
              color={purple}
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
        >
          <Ionicons
            name="stats-chart-outline"
            size={28}
            color={purple}
          />

          <Text
            style={[
              styles.emptyTitle,
              { color: primaryText },
            ]}
          >
            No progress recorded yet
          </Text>

          <Text
            style={[
              styles.emptyDescription,
              { color: secondaryText },
            ]}
          >
            Your course progress will appear here
            when learning activity is connected
            to your student account.
          </Text>
        </View>

        {/* QUICK ACTIONS */}
        <Text
          style={[
            styles.quickTitle,
            { color: primaryText },
          ]}
        >
          Quick Actions
        </Text>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: cardBackground,
                borderColor,
              },
            ]}
            onPress={() => router.push("/coding-workspace")}
          >
            <Ionicons
              name="code-slash-outline"
              size={27}
              color={purple}
            />

            <Text
              style={[
                styles.actionText,
                { color: primaryText },
              ]}
            >
              New Project
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: cardBackground,
                borderColor,
              },
            ]}
            onPress={() => router.push("/projects")}
          >
            <Ionicons
              name="folder-open-outline"
              size={27}
              color={purple}
            />

            <Text
              style={[
                styles.actionText,
                { color: primaryText },
              ]}
            >
              My Projects
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI ASSISTANT */}
        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => router.push("/ai-assistance")}
        >
          <View style={styles.aiContent}>
            <Ionicons
              name="sparkles-outline"
              size={25}
              color="#FFFFFF"
            />

            <View style={styles.aiTextContainer}>
              <Text style={styles.aiButtonTitle}>
                AI Assistant
              </Text>

              <Text style={styles.aiButtonText}>
                Get help with your code
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 35,
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 30,
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },

  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  profileLetter: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  greetingContainer: {
    flex: 1,
  },

  greeting: {
    fontSize: 20,
    fontWeight: "bold",
  },

  subGreeting: {
    fontSize: 13,
    marginTop: 3,
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },

  // SECTION HEADERS
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  // SMALL DETAILS BUTTON
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 2,
  },

  detailsText: {
    color: "#8B5CF6",
    fontSize: 13,
    fontWeight: "600",
  },

  // EMPTY DATA CARDS
  emptyCard: {
    padding: 22,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    textAlign: "center",
  },

  // QUICK ACTIONS
  quickTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 12,
  },

  quickActions: {
    flexDirection: "row",
    gap: 12,
  },

  actionButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 22,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // AI ASSISTANT
  aiButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    padding: 18,
    marginTop: 12,
  },

  aiContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  aiTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  aiButtonTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },

  aiButtonText: {
    color: "#EDE9FE",
    fontSize: 13,
    marginTop: 3,
  },
});

