
import { router, useLocalSearchParams } from "expo-router";

import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AssessmentDetailsScreen() {
  // Get the assessment selected on the Coursework screen
  const { assessmentId, assessmentTitle, language } =
    useLocalSearchParams<{
      assessmentId?: string;
      assessmentTitle?: string;
      language?: string;
    }>();

  const selectedLanguage = language || "Python";
  const selectedTitle = assessmentTitle || "Programming Assessment";

  // Check that the assessment ID is valid
  const validAssessmentId =
    typeof assessmentId === "string" &&
    Number.isSafeInteger(Number(assessmentId)) &&
    Number(assessmentId) > 0;

  // Identify which assessment is being displayed
  const isConditionalStatements =
    selectedTitle === "Conditional Statements";

  const isLoops = selectedTitle === "Loops";

  // Open the Coding Workspace
  function openCodingWorkspace() {
    if (!validAssessmentId) {
      Alert.alert(
        "Assessment Not Selected",
        "Please select an assessment from the Coursework screen."
      );
      return;
    }

    router.push({
      pathname: "/coding-workspace",
      params: {
        assessmentId: assessmentId,
        assessmentTitle: selectedTitle,
        language: selectedLanguage,
      },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Assessment Details
            </Text>

            <Text style={styles.headerSubtitle}>
              {selectedLanguage} Programming
            </Text>
          </View>
        </View>

        {/* ASSESSMENT TITLE */}
        <View style={styles.titleCard}>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>
              ASSESSMENT
            </Text>
          </View>

          <Text style={styles.assessmentTitle}>
            {selectedTitle}
          </Text>

          <Text style={styles.assessmentDescription}>
            {isConditionalStatements
              ? "Practise using conditional statements to make decisions in Python."
              : isLoops
              ? "Practise using for loops and while loops to repeat tasks in Python."
              : "Review the assessment instructions before opening the Coding Workspace."}
          </Text>
        </View>

        {/* ASSESSMENT INFORMATION */}
        <Text style={styles.sectionTitle}>
          Assessment Information
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Assessment Type
            </Text>
            <Text style={styles.infoValue}>
              Programming Task
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Assessment
            </Text>
            <Text style={styles.infoValue}>
              {selectedTitle}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Language
            </Text>
            <Text style={styles.infoValue}>
              {selectedLanguage}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Total Marks
            </Text>
            <Text style={styles.infoValue}>
              Not provided
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Estimated Time
            </Text>
            <Text style={styles.infoValue}>
              Not provided
            </Text>
          </View>
        </View>

        {/* ASSESSMENT TASK */}
        <Text style={styles.sectionTitle}>
          Your Task
        </Text>

        <View style={styles.taskCard}>
          {isConditionalStatements ? (
            <>
              <Text style={styles.taskText}>
                Write a Python program that asks the user
                to enter their mark as a percentage.
              </Text>

              <Text style={styles.taskText}>
                Your program must use conditional statements
                to display the correct result based on the
                mark entered.
              </Text>

              <View style={styles.requirement}>
                <Text style={styles.requirementNumber}>1</Text>
                <Text style={styles.requirementText}>
                  If the mark is 80 or higher, display
                  "Distinction".
                </Text>
              </View>

              <View style={styles.requirement}>
                <Text style={styles.requirementNumber}>2</Text>
                <Text style={styles.requirementText}>
                  If the mark is between 50 and 79,
                  display "Pass".
                </Text>
              </View>

              <View style={styles.requirement}>
                <Text style={styles.requirementNumber}>3</Text>
                <Text style={styles.requirementText}>
                  If the mark is below 50, display "Fail".
                </Text>
              </View>

              <Text style={styles.warningText}>
                Note: These are the existing sample instructions.
                The Coding Workspace currently shows a different
                distinction threshold. Confirm the official
                requirements before submitting.
              </Text>
            </>
          ) : isLoops ? (
            <>
              <Text style={styles.taskText}>
                Practise using for loops and while loops
                in Python.
              </Text>

              <Text style={styles.taskText}>
                The full assessment question and marking
                requirements have not yet been loaded
                from the backend.
              </Text>
            </>
          ) : (
            <Text style={styles.taskText}>
              The full assessment instructions have not
              yet been loaded from the backend.
            </Text>
          )}
        </View>

        {/* INSTRUCTIONS */}
        <Text style={styles.sectionTitle}>
          Instructions
        </Text>

        <View style={styles.instructionsCard}>
          <Text style={styles.instruction}>
            • Read the assessment carefully before starting.
          </Text>

          <Text style={styles.instruction}>
            • Write your solution using the required
            programming language.
          </Text>

          <Text style={styles.instruction}>
            • Review and test your code before submitting.
          </Text>

          <Text style={styles.instruction}>
            • You may use the DevMate AI Assistant
            for guidance.
          </Text>

          <Text style={styles.instruction}>
            • Make sure your final solution is your own work.
          </Text>
        </View>

        {/* AI INFORMATION */}
        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Text style={styles.aiIconText}>AI</Text>
          </View>

          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>
              AI Assistance Available
            </Text>

            <Text style={styles.aiDescription}>
              DevMate can provide hints and explanations
              while you work. Your AI interactions may
              be recorded as part of your learning activity.
            </Text>
          </View>
        </View>

        {/* START ASSESSMENT BUTTON */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={openCodingWorkspace}
          accessibilityRole="button"
          accessibilityLabel="Continue Assessment"
        >
          <Text style={styles.startButtonText}>
            Continue Assessment
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Assessment details and submission IDs must be
          verified against the backend before final testing.
        </Text>
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

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

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
    flex: 1,
  },

  infoValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: "#292929",
    marginVertical: 11,
  },

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

  warningText: {
    color: "#FBBF24",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 18,
  },

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

  footerNote: {
    color: "#777777",
    fontSize: 11,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 17,
  },
});
