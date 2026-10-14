// DevMate Student Coding Workspace

import { router } from "expo-router";
import { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CodingWorkspaceScreen() {
  // Store the code written by the student
  const [code, setCode] = useState(
    '# Write your Python solution here\nmark = int(input("Enter your mark: "))\n'
  );

  // Store messages displayed in the output area
  const [output, setOutput] = useState(
    "Your program output will appear here."
  );

  // Show a message until code execution is connected
  function runCode() {
    setOutput(
      "Code execution is not connected yet. Your code has been kept in the editor."
    );
  }

  // Navigate to the submission screen
  function submitCode() {
    if (code.trim() === "") {
      Alert.alert("Empty Code", "Please write your solution first.");
      return;
    }

    router.push({
      pathname: "/submission",
      params: { code: code },
    });
  }

  // Open the AI Assistance screen
  function openAIHelp() {
    router.push("/ai-assistance");
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Coding Workspace</Text>
              <Text style={styles.headerSubtitle}>
                Python Assessment
              </Text>
            </View>
          </View>

          {/* ASSESSMENT QUESTION */}

          <View style={styles.questionCard}>
            <Text style={styles.sectionLabel}>ASSESSMENT 02</Text>

            <Text style={styles.questionTitle}>
              Conditional Statements
            </Text>

            <Text style={styles.questionText}>
              Write a Python program that asks the user to enter
              their mark and displays the correct result.
            </Text>

            <Text style={styles.requirement}>
              • 75 or above: Distinction
            </Text>

            <Text style={styles.requirement}>
              • 50 to 74: Pass
            </Text>

            <Text style={styles.requirement}>
              • Below 50: Fail
            </Text>

            <Text style={styles.questionNote}>
              Use if, elif and else statements.
            </Text>
          </View>

          {/* CODE EDITOR */}

          <View style={styles.editorHeader}>
            <Text style={styles.sectionTitle}>Code Editor</Text>

            <View style={styles.languageBadge}>
              <Text style={styles.languageText}>Python</Text>
            </View>
          </View>

          <View style={styles.editorContainer}>
            <View style={styles.editorToolbar}>
              <Text style={styles.fileName}>main.py</Text>
              <Text style={styles.editorStatus}>Editing</Text>
            </View>

            <View style={styles.codeArea}>
              {/* Line numbers */}

              <View style={styles.lineNumbers}>
                {Array.from(
                  { length: Math.max(10, code.split("\n").length) },
                  (_, index) => (
                    <Text key={index} style={styles.lineNumber}>
                      {index + 1}
                    </Text>
                  )
                )}
              </View>

              {/* Student code */}

              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={setCode}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                textAlignVertical="top"
                keyboardType="default"
                scrollEnabled={false}
                placeholder="Write your Python code here..."
                placeholderTextColor="#666666"
              />
            </View>
          </View>

          {/* ACTION BUTTONS */}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.runButton}
              onPress={runCode}
            >
              <Text style={styles.runButtonText}>▶ Run Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiButton}
              onPress={openAIHelp}
            >
              <Text style={styles.aiButtonText}>AI Help</Text>
            </TouchableOpacity>
          </View>

          {/* OUTPUT AREA */}

          <Text style={styles.sectionTitle}>Output</Text>

          <View style={styles.outputCard}>
            <Text style={styles.outputLabel}>CONSOLE</Text>

            <Text style={styles.outputText}>{output}</Text>
          </View>

          {/* SUBMIT BUTTON */}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={submitCode}
          >
            <Text style={styles.submitButtonText}>
              Submit Code
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Review your code carefully before submitting.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 55,
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  backText: {
    color: "#FFFFFF",
    fontSize: 30,
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: "#888888",
    fontSize: 13,
    marginTop: 4,
  },

  questionCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 18,
    marginBottom: 26,
  },

  sectionLabel: {
    color: "#8B5CF6",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 9,
  },

  questionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 12,
  },

  questionText: {
    color: "#CCCCCC",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 13,
  },

  requirement: {
    color: "#AAAAAA",
    fontSize: 13,
    lineHeight: 23,
  },

  questionNote: {
    color: "#A78BFA",
    fontSize: 12,
    marginTop: 12,
  },

  editorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  languageBadge: {
    backgroundColor: "#2D2140",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  languageText: {
    color: "#A78BFA",
    fontSize: 12,
    fontWeight: "bold",
  },

  editorContainer: {
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },

  editorToolbar: {
    backgroundColor: "#202020",
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  fileName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  editorStatus: {
    color: "#888888",
    fontSize: 11,
  },

  codeArea: {
    flexDirection: "row",
    minHeight: 260,
    paddingVertical: 15,
  },

  lineNumbers: {
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#333333",
    alignItems: "flex-end",
  },

  lineNumber: {
    color: "#666666",
    fontSize: 13,
    lineHeight: 22,
    fontFamily: "monospace",
  },

  codeInput: {
    flex: 1,
    minHeight: 260,
    color: "#E5E5E5",
    fontSize: 13,
    lineHeight: 22,
    fontFamily: "monospace",
    paddingHorizontal: 12,
    paddingVertical: 0,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },

  runButton: {
    flex: 1,
    backgroundColor: "#8B5CF6",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  runButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  aiButton: {
    flex: 1,
    backgroundColor: "#242424",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },

  aiButtonText: {
    color: "#A78BFA",
    fontSize: 14,
    fontWeight: "bold",
  },

  outputCard: {
    backgroundColor: "#141414",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
    padding: 17,
    minHeight: 110,
    marginBottom: 25,
  },

  outputLabel: {
    color: "#777777",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 12,
  },

  outputText: {
    color: "#CCCCCC",
    fontSize: 13,
    fontFamily: "monospace",
    lineHeight: 20,
  },

  submitButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: "center",
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  footerNote: {
    color: "#777777",
    fontSize: 11,
    textAlign: "center",
    marginTop: 12,
  },
});

