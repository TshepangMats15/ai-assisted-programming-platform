
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import api from "../constants/api";

import {
  Alert,
  Image,
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

type Language =
  | "Auto Detect"
  | "Python"
  | "Java"
  | "JavaScript"
  | "TypeScript"
  | "C"
  | "C++"
  | "C#"
  | "HTML"
  | "CSS"
  | "SQL";

const languages: Language[] = [
  "Auto Detect",
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "C",
  "C++",
  "C#",
  "HTML",
  "CSS",
  "SQL",
];

// Detect the likely programming language from the code
function detectLanguage(code: string): string {
  const text = code.trim();

  if (!text) return "Not detected";

  if (/<(!DOCTYPE html|html|head|body|div|span)\b/i.test(text)) {
    return "HTML";
  }

  if (/\b(SELECT|INSERT INTO|CREATE TABLE|UPDATE|DELETE FROM)\b/i.test(text)) {
    return "SQL";
  }

  if (/using System|Console\.WriteLine/.test(text)) {
    return "C#";
  }

  if (/#include\s*<iostream>|std::|cout\s*<</.test(text)) {
    return "C++";
  }

  if (/#include\s*<stdio\.h>|printf\s*\(|scanf\s*\(/.test(text)) {
    return "C";
  }

  if (/System\.out\.println|public static void main|import java\./.test(text)) {
    return "Java";
  }

  if (/\b(interface|type)\s+\w+|:\s*(string|number|boolean)\b/.test(text)) {
    return "TypeScript";
  }

  if (/def\s+\w+\s*\(|print\s*\(|elif\b|from\s+\w+\s+import/.test(text)) {
    return "Python";
  }

  if (/console\.log|function\s+\w+|const\s+\w+|let\s+\w+/.test(text)) {
    return "JavaScript";
  }

  if (/[.#]?[a-z][\w-]*\s*\{[^}]*:\s*[^}]+;/.test(text)) {
    return "CSS";
  }

  return "Not detected";
}

export default function CodingWorkspaceScreen() {
  // Get the assessment selected by the student
  const { assessmentId } = useLocalSearchParams<{
    assessmentId?: string;
  }>();

  // Validate the assessment ID before submitting
  const selectedAssessmentId = Number(assessmentId);

  const validAssessmentId =
    assessmentId !== undefined &&
    Number.isSafeInteger(selectedAssessmentId) &&
    selectedAssessmentId > 0;

  // Start with an empty editor
  const [code, setCode] = useState("");

  // Selected programming language
  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>("Auto Detect");

  // Show or hide language options
  const [showLanguages, setShowLanguages] = useState(false);

  // Determine which language to display
  const currentLanguage =
    selectedLanguage === "Auto Detect"
      ? detectLanguage(code)
      : selectedLanguage;

  // Store messages displayed in the output area
  const [output, setOutput] = useState(
    "Your program output will appear here."
  );

  // Store the photo selected by the student
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Prevent repeated submissions
  const [submitting, setSubmitting] = useState(false);

  // Ask for camera permission and take a picture
  async function takePhoto() {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission",
          "Please allow camera access to take a photo."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        "Camera Error",
        "Unable to open the camera. Please try again."
      );
    }
  }

  // Choose an existing screenshot or photo
  async function uploadScreenshot() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        "Gallery Error",
        "Unable to select an image. Please try again."
      );
    }
  }

  // The AI image endpoint still needs to be connected
  function analyzeImage() {
    if (!selectedImage) {
      Alert.alert(
        "No Image",
        "Take a photo or upload a screenshot first."
      );
      return;
    }

    Alert.alert(
      "AI Image Analysis",
      "Your image is ready. AI image analysis will work once the backend image endpoint is connected."
    );
  }

  // Code execution has not yet been connected
  function runCode() {
    setOutput(
      "Code execution is not connected yet. Your code has been kept in the editor."
    );
  }

  // Submit the student's code to the existing Spring Boot API
  async function submitCode() {
    if (submitting) {
      return;
    }

    // Prevent empty submissions
    if (code.trim() === "") {
      Alert.alert(
        "Empty Code",
        "Please write your solution before submitting."
      );
      return;
    }

    // Make sure the student selected a real assessment
    if (!validAssessmentId) {
      Alert.alert(
        "Assessment Not Selected",
        "Please open the Coding Workspace from an assessment before submitting your code."
      );
      return;
    }

    try {
      setSubmitting(true);
      setOutput("Submitting your code...");

      // Submit to the existing backend endpoint
      const result = await api.submissions.submitCode({
        assessmentId: selectedAssessmentId,
        sourceCode: code,
        attemptNumber: 1,
      });

      // Display successful submission details
      setOutput(
        `Submission successful!\n` +
          `Submission ID: #${result.submissionId}\n` +
          `Submitted at: ${result.submittedAt}\n` +
          `${result.message || ""}`
      );

      Alert.alert(
        "Submission Successful",
        "Your code has been submitted successfully.",
        [
          {
            text: "View Submissions",
            onPress: () => router.push("/submission"),
          },
          {
            text: "Continue Coding",
            style: "cancel",
          },
        ]
      );
    } catch (error: any) {
      // Keep the student's code in the editor
      const message =
        error?.message || "An unexpected error occurred.";

      setOutput(
        `Submission failed.\n${message}\n\n` +
          "Your code is still available in the editor."
      );

      Alert.alert(
        "Submission Failed",
        "Your code was not submitted. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Open the AI Assistance screen
  function openAIHelp() {
    router.push("/ai-assistance");
  }

  // File name based on the programming language
  function getFileName() {
    switch (currentLanguage) {
      case "Python":
        return "main.py";
      case "Java":
        return "Main.java";
      case "JavaScript":
        return "main.js";
      case "TypeScript":
        return "main.ts";
      case "C":
        return "main.c";
      case "C++":
        return "main.cpp";
      case "C#":
        return "Program.cs";
      case "HTML":
        return "index.html";
      case "CSS":
        return "style.css";
      case "SQL":
        return "query.sql";
      default:
        return "untitled";
    }
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
              <Ionicons
                name="chevron-back"
                size={26}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>
                Coding Workspace
              </Text>

              <Text style={styles.headerSubtitle}>
                {validAssessmentId
                  ? `Assessment #${selectedAssessmentId}`
                  : "Student Coding Environment"}
              </Text>
            </View>
          </View>

          {/* ASSESSMENT INFORMATION */}
          <View style={styles.questionCard}>
            <Text style={styles.sectionLabel}>
              ASSESSMENT
            </Text>

            <Text style={styles.questionTitle}>
              {validAssessmentId
                ? `Assessment #${selectedAssessmentId}`
                : "No Assessment Selected"}
            </Text>

            <Text style={styles.questionText}>
              {validAssessmentId
                ? "Write your solution in the code editor below. Review the assessment instructions before submitting."
                : "Open this workspace from an assessment to submit your code."}
            </Text>

            <Text style={styles.questionNote}>
              Your code will be submitted to the selected assessment.
            </Text>
          </View>

          {/* CODE EDITOR HEADER */}
          <View style={styles.editorHeader}>
            <Text style={styles.sectionTitle}>
              Code Editor
            </Text>

            <TouchableOpacity
              style={styles.languageBadge}
              onPress={() => setShowLanguages(!showLanguages)}
            >
              <Text style={styles.languageText}>
                {currentLanguage} ▼
              </Text>
            </TouchableOpacity>
          </View>

          {/* PROGRAMMING LANGUAGE SELECTION */}
          {showLanguages && (
            <View style={styles.languageMenu}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language}
                  style={styles.languageOption}
                  onPress={() => {
                    setSelectedLanguage(language);
                    setShowLanguages(false);
                  }}
                >
                  <Text style={styles.languageOptionText}>
                    {language}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* CODE EDITOR */}
          <View style={styles.editorContainer}>
            <View style={styles.editorToolbar}>
              <Text style={styles.fileName}>
                {getFileName()}
              </Text>

              <Text style={styles.editorStatus}>
                Editing
              </Text>
            </View>

            <View style={styles.codeArea}>
              {/* LINE NUMBERS */}
              <View style={styles.lineNumbers}>
                {Array.from(
                  {
                    length: Math.max(
                      10,
                      code.split("\n").length
                    ),
                  },
                  (_, index) => (
                    <Text
                      key={index}
                      style={styles.lineNumber}
                    >
                      {index + 1}
                    </Text>
                  )
                )}
              </View>

              {/* STUDENT CODE */}
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
                placeholder="Write your code here..."
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
              <Ionicons
                name="play"
                size={17}
                color="#FFFFFF"
              />
              <Text style={styles.runButtonText}>
                Run Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiButton}
              onPress={openAIHelp}
            >
              <Ionicons
                name="sparkles-outline"
                size={18}
                color="#A78BFA"
              />
              <Text style={styles.aiButtonText}>
                AI Help
              </Text>
            </TouchableOpacity>
          </View>

          {/* CAMERA AND SCREENSHOT ASSISTANCE */}
          <Text style={styles.sectionTitle}>
            Camera Code Assistant
          </Text>

          <Text style={styles.cameraDescription}>
            Take a photo of code or an error on your computer
            screen, or upload an existing screenshot.
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={takePhoto}
            >
              <Ionicons
                name="camera-outline"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.cameraButtonText}>
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.galleryButton}
              onPress={uploadScreenshot}
            >
              <Ionicons
                name="images-outline"
                size={18}
                color="#A78BFA"
              />
              <Text style={styles.galleryButtonText}>
                Upload Screenshot
              </Text>
            </TouchableOpacity>
          </View>

          {/* IMAGE PREVIEW */}
          {selectedImage && (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>
                Selected Image
              </Text>

              <Image
                source={{ uri: selectedImage }}
                style={styles.imagePreview}
                resizeMode="contain"
              />

              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.removeImageText}>
                  Remove Photo
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* AI IMAGE ANALYSIS */}
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              !selectedImage && styles.disabledButton,
            ]}
            onPress={analyzeImage}
            disabled={!selectedImage}
          >
            <Ionicons
              name="sparkles-outline"
              size={19}
              color="#FFFFFF"
            />
            <Text style={styles.analyzeButtonText}>
              Analyze Image with AI
            </Text>
          </TouchableOpacity>

          <Text style={styles.cameraNote}>
            Image capture is ready. AI image analysis
            requires a backend connection.
          </Text>

          {/* OUTPUT AREA */}
          <Text style={styles.sectionTitle}>
            Output
          </Text>

          <View style={styles.outputCard}>
            <Text style={styles.outputLabel}>
              CONSOLE
            </Text>

            <Text style={styles.outputText}>
              {output}
            </Text>
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.disabledButton,
            ]}
            onPress={submitCode}
            disabled={submitting}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.submitButtonText}>
              {submitting ? "Submitting..." : "Submit Code"}
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

  languageMenu: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#8B5CF6",
    marginBottom: 15,
    padding: 8,
  },

  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },

  languageOptionText: {
    color: "#FFFFFF",
    fontSize: 14,
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
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
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
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },

  aiButtonText: {
    color: "#A78BFA",
    fontSize: 14,
    fontWeight: "bold",
  },

  cameraDescription: {
    color: "#AAAAAA",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },

  cameraButton: {
    flex: 1,
    backgroundColor: "#8B5CF6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  cameraButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },

  galleryButton: {
    flex: 1,
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: "#8B5CF6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  galleryButtonText: {
    color: "#A78BFA",
    fontSize: 12,
    fontWeight: "bold",
  },

  previewCard: {
    backgroundColor: "#1A1A1A",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },

  previewTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
  },

  imagePreview: {
    width: "100%",
    height: 260,
    backgroundColor: "#0D0D0D",
    borderRadius: 8,
  },

  removeImageButton: {
    alignItems: "center",
    paddingTop: 14,
  },

  removeImageText: {
    color: "#F87171",
    fontWeight: "bold",
  },

  analyzeButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 8,
  },

  disabledButton: {
    opacity: 0.45,
  },

  analyzeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },

  cameraNote: {
    color: "#888888",
    fontSize: 12,
    marginBottom: 28,
    lineHeight: 18,
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
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
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
