// DevMate Student Assessments Screen

import { router } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AssessmentsScreen() {
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

          <View>
            <Text style={styles.title}>Coursework</Text>
            <Text style={styles.subtitle}>
              Basics of Python Programming
            </Text>
          </View>
        </View>

        {/* ================= COURSE PROGRESS ================= */}

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View>
              <Text style={styles.progressTitle}>Course Progress</Text>
              <Text style={styles.progressSubtitle}>
                Keep going, you're making progress.
              </Text>
            </View>

            <Text style={styles.percentage}>70%</Text>
          </View>

          <View style={styles.progressBackground}>
            <View style={[styles.progressBar, { width: "70%" }]} />
          </View>
        </View>

        {/* ================= ASSESSMENTS ================= */}

        <Text style={styles.sectionTitle}>Assessments</Text>

        {/* Assessment 1 - Completed */}

        <TouchableOpacity
          style={styles.assessmentCard}
          disabled={true}
        >
          <View style={styles.cardTop}>
            <View style={styles.numberBox}>
              <Text style={styles.numberText}>01</Text>
            </View>

            <View style={styles.assessmentInfo}>
              <Text style={styles.assessmentTitle}>
                Variables and Data Types
              </Text>

              <Text style={styles.assessmentType}>
                Programming Assessment
              </Text>
            </View>

            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>DONE</Text>
            </View>
          </View>

          <Text style={styles.description}>
            Test your understanding of Python variables, basic data types
            and user input.
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.completedStatus}>Completed</Text>
            <Text style={styles.score}>85%</Text>
          </View>
        </TouchableOpacity>

        {/* Assessment 2 - In Progress */}

        <TouchableOpacity
          style={styles.assessmentCard}
          onPress={() => router.push("/assessment-details")}
        >
          <View style={styles.cardTop}>
            <View style={styles.numberBox}>
              <Text style={styles.numberText}>02</Text>
            </View>

            <View style={styles.assessmentInfo}>
              <Text style={styles.assessmentTitle}>
                Conditional Statements
              </Text>

              <Text style={styles.assessmentType}>
                Programming Assessment
              </Text>
            </View>

            <View style={styles.inProgressBadge}>
              <Text style={styles.inProgressText}>ACTIVE</Text>
            </View>
          </View>

          <Text style={styles.description}>
            Use if, elif and else statements to solve a programming
            problem.
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.continueText}>Continue Assessment</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Assessment 3 - Not Started */}

        <TouchableOpacity
          style={styles.assessmentCard}
          onPress={() => router.push("/assessment-details")}
        >
          <View style={styles.cardTop}>
            <View style={styles.numberBox}>
              <Text style={styles.numberText}>03</Text>
            </View>

            <View style={styles.assessmentInfo}>
              <Text style={styles.assessmentTitle}>
                Loops
              </Text>

              <Text style={styles.assessmentType}>
                Programming Assessment
              </Text>
            </View>

            <View style={styles.notStartedBadge}>
              <Text style={styles.notStartedText}>NOT STARTED</Text>
            </View>
          </View>

          <Text style={styles.description}>
            Practice using for loops and while loops to repeat tasks in
            Python.
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.startText}>Start Assessment</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Assessment 4 - Locked */}

        <TouchableOpacity
          style={styles.assessmentCard}
          disabled={true}
        >
          <View style={styles.cardTop}>
            <View style={styles.numberBox}>
              <Text style={styles.numberText}>04</Text>
            </View>

            <View style={styles.assessmentInfo}>
              <Text style={styles.assessmentTitle}>
                Functions
              </Text>

              <Text style={styles.assessmentType}>
                Programming Assessment
              </Text>
            </View>

            <View style={styles.lockedBadge}>
              <Text style={styles.lockedText}>LOCKED</Text>
            </View>
          </View>

          <Text style={styles.description}>
            Learn how to create and use functions to organise reusable
            Python code.
          </Text>

          <Text style={styles.lockMessage}>
            Complete the previous assessment to unlock.
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
    paddingBottom: 40,
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

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#888888",
    fontSize: 13,
    marginTop: 3,
  },

  // PROGRESS

  progressCard: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 12,
    marginBottom: 28,
  },

  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  progressTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  progressSubtitle: {
    color: "#888888",
    fontSize: 12,
    marginTop: 4,
  },

  percentage: {
    color: "#8B5CF6",
    fontSize: 18,
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

  // ASSESSMENTS

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  assessmentCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  numberBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#2D2140",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  numberText: {
    color: "#A78BFA",
    fontSize: 13,
    fontWeight: "bold",
  },

  assessmentInfo: {
    flex: 1,
  },

  assessmentTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  assessmentType: {
    color: "#777777",
    fontSize: 11,
    marginTop: 4,
  },

  description: {
    color: "#A3A3A3",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },

  // BADGES

  completedBadge: {
    backgroundColor: "#163A2A",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  completedText: {
    color: "#4ADE80",
    fontSize: 9,
    fontWeight: "bold",
  },

  inProgressBadge: {
    backgroundColor: "#2D2140",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  inProgressText: {
    color: "#A78BFA",
    fontSize: 9,
    fontWeight: "bold",
  },

  notStartedBadge: {
    backgroundColor: "#292929",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  notStartedText: {
    color: "#A3A3A3",
    fontSize: 9,
    fontWeight: "bold",
  },

  lockedBadge: {
    backgroundColor: "#292929",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  lockedText: {
    color: "#666666",
    fontSize: 9,
    fontWeight: "bold",
  },

  // CARD FOOTER

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#292929",
  },

  completedStatus: {
    color: "#4ADE80",
    fontSize: 12,
    fontWeight: "600",
  },

  score: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },

  continueText: {
    color: "#8B5CF6",
    fontSize: 12,
    fontWeight: "bold",
  },

  startText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  arrow: {
    color: "#8B5CF6",
    fontSize: 24,
  },

  lockMessage: {
    color: "#666666",
    fontSize: 11,
    marginTop: 14,
    fontStyle: "italic",
  },
});
