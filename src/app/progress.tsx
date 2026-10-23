
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

// Temporary progress data
const courses = [
  { name: "Python Programming", progress: 70 },
  { name: "Introduction to Web Design", progress: 45 },
  { name: "Intermediate Programming", progress: 20 },
];

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Progress</Text>
        <Text style={styles.subtitle}>
          Track your learning journey and achievements.
        </Text>

        {/* ================= OVERVIEW ================= */}

        <Text style={styles.sectionTitle}>Learning Overview</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>45%</Text>
            <Text style={styles.statLabel}>Overall</Text>
          </View>
        </View>

        {/* ================= COURSE PROGRESS ================= */}

        <Text style={styles.sectionTitle}>Course Progress</Text>

        {courses.map((course) => (
          <View key={course.name} style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <Text style={styles.courseName}>
                {course.name}
              </Text>
              <Text style={styles.percentage}>
                {course.progress}%
              </Text>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${course.progress}%` },
                ]}
              />
            </View>
          </View>
        ))}

        {/* ================= ACHIEVEMENTS ================= */}

        <Text style={styles.sectionTitle}>Achievements</Text>

        <View style={styles.achievementCard}>
          <Text style={styles.achievementIcon}>★</Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>
              Getting Started
            </Text>
            <Text style={styles.achievementDescription}>
              Started your programming learning journey.
            </Text>
          </View>
        </View>

        <View style={styles.achievementCard}>
          <Text style={styles.achievementIcon}>★</Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>
              Python Explorer
            </Text>
            <Text style={styles.achievementDescription}>
              Made progress in Python Programming.
            </Text>
          </View>
        </View>

        <Text style={styles.demoText}>
          Progress information is sample data until connected to
          the backend.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles for the Progress screen
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
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingVertical: 22,
    alignItems: "center",
  },
  statNumber: {
    color: "#8B5CF6",
    fontSize: 23,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#A3A3A3",
    fontSize: 11,
    marginTop: 7,
  },
  courseCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 10,
  },
  courseName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
  },
  percentage: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "bold",
  },
  progressBackground: {
    height: 7,
    backgroundColor: "#333333",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: 7,
    backgroundColor: "#8B5CF6",
    borderRadius: 4,
  },
  achievementCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 17,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  achievementIcon: {
    color: "#A78BFA",
    fontSize: 28,
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  achievementDescription: {
    color: "#888888",
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },
  demoText: {
    color: "#777777",
    fontSize: 12,
    marginTop: 15,
    textAlign: "center",
  },
});
