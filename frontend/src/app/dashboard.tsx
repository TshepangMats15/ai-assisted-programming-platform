
// DevMate Student Home / Dashboard
import React from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../services/firebase";
import { useAppTheme } from "../context/ThemeContext";

export default function DashboardScreen() {
  const { isDark, colors } = useAppTheme();
  const student = auth.currentUser;

  // Extract student's first name dynamically
  const fullName = student?.displayName?.trim() || "Student";
  const firstName = fullName.split(" ")[0];
  const profileLetter = firstName.charAt(0).toUpperCase();

  const background = colors.background;
  const cardBackground = isDark ? "#1A1A1A" : "#FFFFFF";
  const primaryText = isDark ? "#FFFFFF" : "#171717";
  const secondaryText = isDark ? "#A3A3A3" : "#666666";
  const borderColor = isDark ? "#292929" : "#E5E7EB";
  const purple = "#8B5CF6";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* STUDENT HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.profileSection} onPress={() => router.push("/profile")}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileLetter}>{profileLetter}</Text>
            </View>

            <View style={styles.greetingContainer}>
              <Text style={[styles.greeting, { color: primaryText }]} numberOfLines={1}>
                Hi, {firstName}
              </Text>
              <Text style={[styles.subGreeting, { color: secondaryText }]}>
                Let's start learning...
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: cardBackground }]}
            onPress={() => router.push("/notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color={purple} />
          </TouchableOpacity>
        </View>

        {/* ANNOUNCEMENTS FROM ADMIN */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: primaryText }]}>Announcements</Text>
        </View>

        <View style={[styles.emptyCard, { backgroundColor: cardBackground, borderColor }]}>
          <Ionicons name="megaphone-outline" size={28} color={purple} />
          <Text style={[styles.emptyTitle, { color: primaryText }]}>No announcements available</Text>
          <Text style={[styles.emptyDescription, { color: secondaryText }]}>
            Admin announcements will appear here.
          </Text>
        </View>

        {/* QUICK ACTIONS */}
        <Text style={[styles.quickTitle, { color: primaryText }]}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBackground, borderColor }]}
            onPress={() => router.push("/coding-workspace")}
          >
            <Ionicons name="code-slash-outline" size={27} color={purple} />
            <Text style={[styles.actionText, { color: primaryText }]}>New Project</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBackground, borderColor }]}
            onPress={() => router.push("/projects")}
          >
            <Ionicons name="folder-open-outline" size={27} color={purple} />
            <Text style={[styles.actionText, { color: primaryText }]}>My Projects</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 35 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 15, marginBottom: 25 },
  profileSection: { flexDirection: "row", alignItems: "center", flex: 1 },
  profileCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#8B5CF6", justifyContent: "center", alignItems: "center", marginRight: 12 },
  profileLetter: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  greetingContainer: { flex: 1 },
  greeting: { fontSize: 20, fontWeight: "bold" },
  subGreeting: { fontSize: 13, marginTop: 2 },
  notificationButton: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  emptyCard: { padding: 20, borderRadius: 12, borderWidth: 1, alignItems: "center", marginBottom: 20 },
  emptyTitle: { fontSize: 15, fontWeight: "bold", marginTop: 10 },
  emptyDescription: { fontSize: 13, marginTop: 4, textAlign: "center" },
  quickTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  quickActions: { flexDirection: "row", gap: 12 },
  actionButton: { flex: 1, borderWidth: 1, paddingVertical: 20, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 8 },
  actionText: { fontSize: 14, fontWeight: "600" },
});