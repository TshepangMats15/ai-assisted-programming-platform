// DevMate Student Assessment Details Screen

import { router } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AssessmentDetailsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Assessment Details</Text>
            <Text style={styles.headerSubtitle}>
              Python Programming
            </Text>
          </View>
        </View>

        {/* ================= ASSESSMENT TITLE ================= */}

        <View style={styles.titleCard}>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>

          <Text style={styles.assessmentTitle}>
            Conditional Statements
          </Text>

          <Text style={styles.assessmentDescription}>
            Complete this programming task to demonstrate your
            understanding of conditional statements in Python.
          </Text>
        </View>

        {/* ================= ASSESSMENT INFORMATION ================= */}

        <Text style={styles.sectionTitle}>Assessment Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Assessment Type</Text>
            <Text style={styles.infoValue}>Programming Task</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Marks</Text>
            <Text style={styles.infoValue}>20 Marks</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estimated Time</Text>
            <Text style={styles.infoValue}>30 Minutes</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Language</Text>
            <Text style={styles.infoValue}>Python</Text>
          </View>
        </View>

        {/* ================= TASK ================= */}

        <Text style={styles.sectionTitle}>Your Task</Text>

        <View style={styles.taskCard}>
          <Text style={styles.taskText}>
            Write a Python program that asks the user to enter their
            mark as a percentage.
          </Text>

          <Text style={styles.taskText}>
            Your program must use conditional statements to display the
            correct result based on the mark entered.
          </Text>

          <View style={styles.requirement}>
            <Text style={styles.requirementNumber}>1</Text>
            <Text style={styles.requirementText}>
              If the mark is 75 or higher, display "Distinction".
            </Text>
          </View>

          <View style={styles.requirement}>
            <Text style={styles.requirementNumber}>2</Text>
            <Text style={styles.requirementText}>
              If the mark is between 50 and 74, display "Pass".
            </Text>
          </View>

          <View style={styles.requirement}>
            <Text style={styles.requirementNumber}>3</Text>
            <Text style={styles.requirementText}>
              If the mark is below 50, display "Fail".
            </Text>
          </View>
        </View>

        {/* ================= RULES ================= */}

        <Text style={styles.sectionTitle}>Instructions</Text>

        <View style={styles.instructionsCard}>
          <Text style={styles.instruction}>
            • Read the question carefully before starting.
          </Text>

          <Text style={styles.instruction}>
            • Write your solution using Python.
          </Text>

          <Text style={styles.instruction}>
            • Test your code before submitting.
          </Text>

          <Text style={styles.instruction}>
            • You may use the DevMate AI Assistant for guidance.
          </Text>

          <Text style={styles.instruction}>
            • Make sure your final solution is your own work.
          </Text>
        </View>

        {/* ================= AI INFORMATION ================= */}

        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Text style={styles.aiIconText}>AI</Text>
          </View>

          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>AI Assistance Available</Text>

            <Text style={styles.aiDescription}>
              DevMate can provide hints and explanations while you work.
              Your AI interactions may be recorded as part of your
              learning activity.
            </Text>
          </View>
        </View>

        {/* ================= START BUTTON ================= */}

        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}
            onPress={() => router.push("/coding-workspace")}
          >
            Continue Assessment
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 45,
  },

  // HEADER

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  backText: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 32,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: "#888888",
    fontSize: 13,
    marginTop: 3,
  },

  // TITLE CARD

  titleCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 20,
    marginBottom: 28,
  },

  activeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#2D2140",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },

  activeBadgeText: {
    color: "#A78BFA",
    fontSize: 9,
    fontWeight: "bold",
  },

  assessmentTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  assessmentDescription: {
    color: "#A3A3A3",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },

  // SECTIONS

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  // INFORMATION

  infoCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 17,
    marginBottom: 28,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },

  infoLabel: {
    color: "#888888",
    fontSize: 13,
  },

  infoValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#292929",
    marginVertical: 11,
  },

  // TASK

  taskCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 18,
    marginBottom: 28,
  },

  taskText: {
    color: "#D4D4D4",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 13,
  },

  requirement: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },

  requirementNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2D2140",
    color: "#A78BFA",
    textAlign: "center",
    lineHeight: 26,
    fontSize: 11,
    fontWeight: "bold",
    marginRight: 10,
  },

  requirementText: {
    flex: 1,
    color: "#A3A3A3",
    fontSize: 12,
    lineHeight: 18,
    paddingTop: 4,
  },

  // INSTRUCTIONS

  instructionsCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },

  instruction: {
    color: "#A3A3A3",
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 5,
  },

  // AI CARD

  aiCard: {
    backgroundColor: "#17131F",
    borderWidth: 1,
    borderColor: "#2D2140",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    marginBottom: 25,
  },

  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  aiIconText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  aiContent: {
    flex: 1,
  },

  aiTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },

  aiDescription: {
    color: "#A3A3A3",
    fontSize: 12,
    lineHeight: 18,
  },

  // BUTTON

  startButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  startButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});