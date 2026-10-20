
import React, { useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

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

import { api } from "../constants/api";

export default function CodingWorkspaceScreen() {
  // Store the student's Python code
  const [code, setCode] = useState(
    '# Write your Python solution here\nmark = int(input("Enter your mark: "))\n'
  );

  // Store output messages
  const [output, setOutput] = useState(
    "Your program output will appear here."
  );

  // Store the selected image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Track submission progress
  const [submitting, setSubmitting] = useState(false);

  // Submit code to the backend
  async function handleSubmit() {
    if (code.trim() === "") {
      Alert.alert(
        "Empty Code",
        "Please write your Python solution first."
      );
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.submissions.submitCode({
        assessmentId: 1,
        sourceCode: code,
        attemptNumber: 1,
      });

      Alert.alert(
        "Submission Successful",
        `Submission #${response.submissionId} submitted successfully!`,
        [
          {
            text: "OK",
            onPress: () => router.push("/submission"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Submission Failed",
        error?.message || "Unable to connect to the backend."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Take a photo using the camera
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
        "Unable to open the camera."
      );
    }
  }

  // Upload an image from the gallery
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
        "Unable to select an image."
      );
    }
  }

  // Analyze the selected image
  function analyzeImage() {
    if (!selectedImage) {
      Alert.alert(
        "No Image",
        "Please select an image first."
      );
      return;
    }

    Alert.alert(
      "AI Image Analysis",
      "Your image is ready. AI image analysis requires a backend connection."
    );
  }

  // Run Python code
  function runCode() {
    if (code.trim() === "") {
      Alert.alert(
        "Empty Code",
        "Please write some Python code first."
      );
      return;
    }

    setOutput(
      "Code execution is not connected yet. Your code has been kept in the editor."
    );
  }

  // Open AI Assistance
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
              <Text style={styles.backText}>{"‹"}</Text>
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>
                Coding Workspace
              </Text>
              <Text style={styles.headerSubtitle}>
                Python Assessment
              </Text>
            </View>
          </View>

          {/* ASSESSMENT QUESTION */}
          <View style={styles.questionCard}>
            <Text style={styles.sectionLabel}>
              ASSESSMENT 02
            </Text>

            <Text style={styles.questionTitle}>
              Conditional Statements
            </Text>

            <Text style={styles.questionText}>
              Write a Python program that asks the user
              to enter their mark and displays the
              correct result.
            </Text>

            <Text style={styles.requirement}>
              {"• 75 or above: Distinction"}
            </Text>

            <Text style={styles.requirement}>
              {"• 50 to 74: Pass"}
            </Text>

            <Text style={styles.requirement}>
              {"• Below 50: Fail"}
            </Text>

            <Text style={styles.questionNote}>
              Use if, elif and else statements.
            </Text>
          </View>

          {/* CODE EDITOR HEADER */}
          <View style={styles.editorHeader}>
            <Text style={styles.sectionTitle}>
              Code Editor
            </Text>

            <View style={styles.languageBadge}>
              <Text style={styles.languageText}>
                Python
              </Text>
            </View>
          </View>

          {/* CODE EDITOR */}
          <View style={styles.editorContainer}>
            <View style={styles.editorToolbar}>
              <Text style={styles.fileName}>
                main.py
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

              {/* PYTHON INPUT */}
              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={setCode}
                multiline={true}
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

          {/* RUN AND AI HELP */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.runButton}
              onPress={runCode}
            >
              <Text style={styles.runButtonText}>
                ▶ Run Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiButton}
              onPress={openAIHelp}
            >
              <Text style={styles.aiButtonText}>
                AI Help
              </Text>
            </TouchableOpacity>
          </View>

          {/* CAMERA ASSISTANT */}
          <Text style={styles.sectionTitle}>
            Camera Code Assistant
          </Text>

          <Text style={styles.cameraDescription}>
            Take a photo of code or an error on your
            computer screen, or upload an existing
            screenshot.
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={takePhoto}
            >
              <Text style={styles.cameraButtonText}>
                📷 Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.galleryButton}
              onPress={uploadScreenshot}
            >
              <Text style={styles.galleryButtonText}>
                Upload Screenshot
              </Text>
            </TouchableOpacity>
          </View>

          {/* IMAGE PREVIEW */}
          {selectedImage !== null && (
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

          {/* ANALYZE IMAGE */}
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              !selectedImage && styles.disabledButton,
            ]}
            onPress={analyzeImage}
            disabled={!selectedImage}
          >
            <Text style={styles.analyzeButtonText}>
              Analyze Image with AI
            </Text>
          </TouchableOpacity>

          <Text style={styles.cameraNote}>
            Image capture is ready. AI image analysis
            requires a backend connection.
          </Text>

          {/* OUTPUT */}
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

          {/* SUBMIT CODE */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting
                ? "Submitting..."
                : "Submit Code"}
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
