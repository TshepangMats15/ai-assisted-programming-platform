
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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

import { useAppTheme } from "../context/ThemeContext";
import api, {
  AssessmentDTO,
  QuestionDTO,
} from "../constants/api";
import {
  analyseCodeImage,
  formatRunResult,
  runCode as runCodeRemote,
} from "../services/Codeaiservices";

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
  | "SQL"
  | "JSON";

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
  "JSON",
];

function normalizeLanguage(
  value?: string | null
): Language | null {
  if (!value) return null;

  const mapping: Record<string, Language> = {
    python: "Python",
    java: "Java",
    javascript: "JavaScript",
    js: "JavaScript",
    typescript: "TypeScript",
    ts: "TypeScript",
    c: "C",
    "c++": "C++",
    cpp: "C++",
    "c#": "C#",
    csharp: "C#",
    html: "HTML",
    css: "CSS",
    sql: "SQL",
    json: "JSON",
  };

  return mapping[value.trim().toLowerCase()] ?? null;
}

function detectLanguage(code: string): string {
  const text = code.trim();

  if (!text) return "Not detected";

  if (
    (text.startsWith("{") && text.endsWith("}")) ||
    (text.startsWith("[") && text.endsWith("]"))
  ) {
    try {
      JSON.parse(text);
      return "JSON";
    } catch {
      // Continue detecting.
    }
  }

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

  if (/[.#]?[a-z][\w-]*\s*\{[^}]*:\s*[^}]+;/i.test(text)) {
    return "CSS";
  }

  return "Not detected";
}

export default function CodingWorkspaceScreen() {
  const { colors, isDark } = useAppTheme();

  const params = useLocalSearchParams<{
    assessmentId?: string;
    questionID?: string;
    language?: string;
    code?: string;
    courseID?: string;
  }>();

  const {
    assessmentId,
    questionID,
    courseID,
  } = params;

  const assessmentIdProvided =
    typeof assessmentId === "string" &&
    assessmentId.trim().length > 0;

  const selectedAssessmentId = Number(assessmentId);

  const validAssessmentId =
    assessmentIdProvided &&
    Number.isSafeInteger(selectedAssessmentId) &&
    selectedAssessmentId > 0;

  const isStandalone = !assessmentIdProvided;

  const [assessment, setAssessment] =
    useState<AssessmentDTO | null>(null);

  const [assessmentQuestions, setAssessmentQuestions] =
    useState<QuestionDTO[]>([]);

  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionDTO | null>(null);

  const [assessmentLoading, setAssessmentLoading] =
    useState(assessmentIdProvided);

  const [assessmentError, setAssessmentError] =
    useState<string | null>(null);

  const [code, setCode] = useState(
    typeof params.code === "string" ? params.code : ""
  );

  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>(
      normalizeLanguage(params.language) ?? "Auto Detect"
    );

  const [showLanguages, setShowLanguages] =
    useState(false);

  const [output, setOutput] = useState(
    "Your program output will appear here."
  );

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const [selectedImageType, setSelectedImageType] =
    useState<string | null>(null);

  const [analysing, setAnalysing] =
    useState(false);

  const [running, setRunning] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const themeStyles = useMemo(
    () => ({
      surface: {
        backgroundColor: colors.backgroundElement,
      },
      text: {
        color: colors.text,
      },
      secondary: {
        color: colors.textSecondary,
      },
      border: {
        borderColor: colors.border,
      },
      editor: {
        backgroundColor: isDark ? "#141414" : "#F8F7FC",
        borderColor: colors.border,
      },
      toolbar: {
        backgroundColor: isDark ? "#202020" : "#EEEAF5",
      },
      accentSurface: {
        backgroundColor: isDark ? "#2D2140" : "#EDE9FE",
      },
      accentText: {
        color: isDark ? "#C4B5FD" : "#6D28D9",
      },
    }),
    [colors, isDark]
  );

  // Standalone coding permits AI.
  // Assessment coding follows the backend aiAllowed field.
  // Missing/failed assessment data never grants AI access.
  const canUseAI =
    isStandalone ||
    (
      validAssessmentId &&
      !assessmentLoading &&
      !assessmentError &&
      assessment?.aiAllowed === true
    );

  const canSubmitAssessment =
    validAssessmentId &&
    !assessmentLoading &&
    !assessmentError &&
    selectedQuestion?.questionType === "CODING_CHALLENGE";

  const loadAssessmentData = useCallback(async () => {
    setAssessmentError(null);

    // Opening the editor directly is valid.
    if (isStandalone) {
      setAssessment(null);
      setAssessmentQuestions([]);
      setSelectedQuestion(null);
      setAssessmentLoading(false);
      return;
    }

    // A supplied but invalid ID is not standalone mode.
    if (!validAssessmentId) {
      setAssessment(null);
      setAssessmentQuestions([]);
      setSelectedQuestion(null);
      setAssessmentError("Invalid assessment ID.");
      setAssessmentLoading(false);
      return;
    }

    try {
      setAssessmentLoading(true);
      setAssessment(null);
      setAssessmentQuestions([]);
      setSelectedQuestion(null);

      const [assessmentData, questionsData] =
        await Promise.all([
          api.assessments.getById(selectedAssessmentId),
          api.assessments.getQuestions(selectedAssessmentId),
        ]);

      const questions = Array.isArray(questionsData)
        ? questionsData
        : [];

      let chosenQuestion: QuestionDTO | null = null;

      if (
        typeof questionID === "string" &&
        questionID.trim()
      ) {
        chosenQuestion =
          questions.find(
            (question) => question.questionID === questionID
          ) ?? null;

        if (!chosenQuestion) {
          throw new Error(
            "The selected question could not be found in this assessment."
          );
        }
      } else {
        chosenQuestion =
          questions.find(
            (question) =>
              question.questionType === "CODING_CHALLENGE"
          ) ?? null;
      }

      setAssessment(assessmentData);
      setAssessmentQuestions(questions);
      setSelectedQuestion(chosenQuestion);

      if (
        chosenQuestion?.starterCode &&
        !params.code
      ) {
        setCode(chosenQuestion.starterCode);
      }
    } catch (error: any) {
      console.warn(
        "[Coding Workspace] Assessment loading failed:",
        error?.message ?? error
      );

      setAssessment(null);
      setAssessmentQuestions([]);
      setSelectedQuestion(null);
      setAssessmentError(
        error?.message || "Unable to load the assessment."
      );
    } finally {
      setAssessmentLoading(false);
    }
  }, [
    isStandalone,
    validAssessmentId,
    selectedAssessmentId,
    questionID,
    params.code,
  ]);

  useEffect(() => {
    loadAssessmentData();
  }, [loadAssessmentData]);

  useEffect(() => {
    const backendLanguage = normalizeLanguage(
      assessment?.programLang
    );

    if (backendLanguage) {
      setSelectedLanguage(backendLanguage);
    }
  }, [assessment?.programLang]);

  const currentLanguage =
    selectedLanguage === "Auto Detect"
      ? detectLanguage(code)
      : selectedLanguage;

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
        setSelectedImageType(
          result.assets[0].mimeType ?? null
        );
      }
    } catch (error) {
      console.warn(
        "[Coding Workspace] Camera error:",
        error
      );

      Alert.alert(
        "Camera Error",
        "Unable to open the camera."
      );
    }
  }

  async function uploadScreenshot() {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.8,
        });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setSelectedImageType(
          result.assets[0].mimeType ?? null
        );
      }
    } catch (error) {
      console.warn(
        "[Coding Workspace] Gallery error:",
        error
      );

      Alert.alert(
        "Gallery Error",
        "Unable to select an image."
      );
    }
  }

  async function analyzeImage() {
    if (!canUseAI) {
      Alert.alert(
        "AI Assistance Disabled",
        "AI image analysis is not allowed for this assessment."
      );
      return;
    }

    if (!selectedImage) {
      Alert.alert(
        "No Image",
        "Take a photo or upload a screenshot first."
      );
      return;
    }

    if (analysing) return;

    try {
      setAnalysing(true);
      setOutput("Analysing your image with DevMate AI...");

      const analysis = await analyseCodeImage(
        selectedImage,
        undefined,
        selectedImageType
      );

      setOutput(analysis);
    } catch (error: any) {
      setOutput(
        `Image analysis failed.\n${
          error?.message || "An unexpected error occurred."
        }`
      );
    } finally {
      setAnalysing(false);
    }
  }

  async function runCode() {
    if (running) return;

    if (!code.trim()) {
      setOutput(
        "Write some code first, then press Run Code."
      );
      return;
    }

    if (currentLanguage === "Not detected") {
      setOutput(
        "Unable to detect the language. Choose one from the language menu."
      );
      return;
    }

    if (
      ["HTML", "CSS", "JSON"].includes(currentLanguage)
    ) {
      setOutput(
        `${currentLanguage} is not directly executable in this code runner.`
      );
      return;
    }

    try {
      setRunning(true);
      setOutput(`Running your ${currentLanguage} code...`);

      const result = await runCodeRemote(
        currentLanguage,
        code
      );

      setOutput(formatRunResult(result));
    } catch (error: any) {
      setOutput(
        `Could not run your code.\n${
          error?.message || "An unexpected error occurred."
        }\n\nYour code is still in the editor.`
      );
    } finally {
      setRunning(false);
    }
  }

  async function submitCode() {
    if (submitting) return;

    if (!code.trim()) {
      Alert.alert(
        "Empty Code",
        "Please write your solution before submitting."
      );
      return;
    }

    if (!canSubmitAssessment) {
      Alert.alert(
        "Assessment Required",
        "Open a coding challenge from Assessment Details before submitting."
      );
      return;
    }

    try {
      setSubmitting(true);
      setOutput("Submitting your code...");

      const result = await api.submissions.submitCode({
        assessmentId: selectedAssessmentId,
        sourceCode: code,
        attemptNumber: 1,
      });

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
      const message =
        error?.message || "An unexpected error occurred.";

      setOutput(
        `Submission failed.\n${message}\n\n` +
        "Your code is still available in the editor."
      );

      Alert.alert(
        "Submission Failed",
        message
      );
    } finally {
      setSubmitting(false);
    }
  }

  function openAIHelp() {
    if (!canUseAI) {
      Alert.alert(
        "AI Assistance Disabled",
        "AI assistance is not allowed for this assessment."
      );
      return;
    }

    // Standalone mode does not invent an assessment ID.
    router.push({
      pathname: "/ai-assistance",
      params: isStandalone
        ? {}
        : {
            assessmentId: String(selectedAssessmentId),
            courseID:
              typeof courseID === "string"
                ? courseID
                : "",
          },
    });
  }

  function getFileName() {
    const names: Record<string, string> = {
      Python: "main.py",
      Java: "Main.java",
      JavaScript: "main.js",
      TypeScript: "main.ts",
      C: "main.c",
      "C++": "main.cpp",
      "C#": "Program.cs",
      HTML: "index.html",
      CSS: "style.css",
      SQL: "query.sql",
      JSON: "data.json",
    };

    return names[currentLanguage] ?? "untitled";
  }

  function getAssessmentLabel() {
    if (isStandalone) return "PRACTICE MODE";

    if (assessment?.assessmentType === "PRE_TEST") {
      return "PRE-ASSESSMENT";
    }

    if (assessment?.assessmentType === "POST_TEST") {
      return "POST-ASSESSMENT";
    }

    return "ASSESSMENT";
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[
                styles.backButton,
                themeStyles.surface,
              ]}
              onPress={() => router.back()}
            >
              <Ionicons
                name="chevron-back"
                size={26}
                color={colors.text}
              />
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <Text
                style={[
                  styles.headerTitle,
                  themeStyles.text,
                ]}
              >
                Coding Workspace
              </Text>

              <Text
                style={[
                  styles.headerSubtitle,
                  themeStyles.secondary,
                ]}
              >
                {assessment?.title ||
                  (isStandalone
                    ? "Student Coding Environment"
                    : `Assessment #${assessmentId}`)}
              </Text>
            </View>
          </View>

          {/* ASSESSMENT / PRACTICE CARD */}
          <View
            style={[
              styles.questionCard,
              themeStyles.surface,
            ]}
          >
            <Text style={styles.sectionLabel}>
              {getAssessmentLabel()}
            </Text>

            <Text
              style={[
                styles.questionTitle,
                themeStyles.text,
              ]}
            >
              {isStandalone
                ? "Free Coding Practice"
                : assessmentLoading
                  ? "Loading assessment..."
                  : assessment?.title ||
                    "Assessment Unavailable"}
            </Text>

            {isStandalone ? (
              <Text
                style={[
                  styles.questionText,
                  themeStyles.secondary,
                ]}
              >
                Write and run your own code below.
                No assessment is required. To submit
                assessed work, open a coding challenge
                from Assessment Details.
              </Text>
            ) : assessmentError ? (
              <>
                <Text
                  style={[
                    styles.questionText,
                    { color: "#F87171" },
                  ]}
                >
                  {assessmentError}
                </Text>

                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={loadAssessmentData}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={17}
                    color="#FFFFFF"
                  />
                  <Text style={styles.retryButtonText}>
                    Try Again
                  </Text>
                </TouchableOpacity>
              </>
            ) : selectedQuestion ? (
              <>
                <Text
                  style={[
                    styles.questionText,
                    themeStyles.secondary,
                  ]}
                >
                  {selectedQuestion.prompt}
                </Text>

                <Text style={styles.questionNote}>
                  {selectedQuestion.questionType ===
                  "CODING_CHALLENGE"
                    ? "Complete this coding challenge in the editor below."
                    : "This question is not a coding challenge."}
                </Text>
              </>
            ) : (
              <Text
                style={[
                  styles.questionText,
                  themeStyles.secondary,
                ]}
              >
                {assessmentLoading
                  ? "Retrieving the assessment question..."
                  : assessmentQuestions.length === 0
                    ? "No questions are available for this assessment."
                    : "This assessment does not contain a coding challenge."}
              </Text>
            )}
          </View>

          {/* EDITOR HEADER */}
          <View style={styles.editorHeader}>
            <Text
              style={[
                styles.sectionTitle,
                themeStyles.text,
              ]}
            >
              Code Editor
            </Text>

            <TouchableOpacity
              style={[
                styles.languageBadge,
                themeStyles.accentSurface,
              ]}
              onPress={() =>
                setShowLanguages(!showLanguages)
              }
            >
              <Text
                style={[
                  styles.languageText,
                  themeStyles.accentText,
                ]}
              >
                {currentLanguage} ▼
              </Text>
            </TouchableOpacity>
          </View>

          {/* LANGUAGE SELECTOR */}
          {showLanguages && (
            <View
              style={[
                styles.languageMenu,
                themeStyles.surface,
              ]}
            >
              {languages.map((language) => (
                <TouchableOpacity
                  key={language}
                  style={[
                    styles.languageOption,
                    {
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedLanguage(language);
                    setShowLanguages(false);
                  }}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      themeStyles.text,
                    ]}
                  >
                    {language}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* CODE EDITOR */}
          <View
            style={[
              styles.editorContainer,
              themeStyles.editor,
            ]}
          >
            <View
              style={[
                styles.editorToolbar,
                themeStyles.toolbar,
              ]}
            >
              <Text
                style={[
                  styles.fileName,
                  themeStyles.text,
                ]}
              >
                {getFileName()}
              </Text>

              <Text
                style={[
                  styles.editorStatus,
                  themeStyles.secondary,
                ]}
              >
                Editing
              </Text>
            </View>

            <View style={styles.codeArea}>
              <View
                style={[
                  styles.lineNumbers,
                  {
                    borderRightColor: colors.border,
                  },
                ]}
              >
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
                      style={[
                        styles.lineNumber,
                        themeStyles.secondary,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )
                )}
              </View>

              <TextInput
                style={[
                  styles.codeInput,
                  themeStyles.text,
                ]}
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
                placeholderTextColor={
                  colors.textSecondary
                }
              />
            </View>
          </View>

          {/* RUN CODE / AI HELP */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.runButton,
                running && styles.disabledButton,
              ]}
              onPress={runCode}
              disabled={running}
            >
              <Ionicons
                name="play"
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.runButtonText}>
                {running ? "Running..." : "Run Code"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.aiButton,
                themeStyles.surface,
                !canUseAI && styles.disabledButton,
              ]}
              onPress={openAIHelp}
              disabled={!canUseAI}
            >
              <Ionicons
                name={
                  canUseAI
                    ? "sparkles-outline"
                    : "lock-closed-outline"
                }
                size={18}
                color={
                  canUseAI
                    ? "#A78BFA"
                    : colors.textSecondary
                }
              />

              <Text
                style={[
                  styles.aiButtonText,
                  canUseAI
                    ? themeStyles.accentText
                    : themeStyles.secondary,
                ]}
              >
                {canUseAI ? "AI Help" : "AI Disabled"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* CAMERA ASSISTANT */}
          <Text
            style={[
              styles.sectionTitle,
              themeStyles.text,
            ]}
          >
            Camera Code Assistant
          </Text>

          <Text
            style={[
              styles.cameraDescription,
              themeStyles.secondary,
            ]}
          >
            Take a photo of code or an error on your
            computer screen, or upload an existing
            screenshot.
          </Text>

          {!canUseAI && (
            <View
              style={[
                styles.aiDisabledNotice,
                themeStyles.surface,
                themeStyles.border,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.textSecondary}
              />

              <Text
                style={[
                  styles.aiDisabledText,
                  themeStyles.secondary,
                ]}
              >
                AI analysis is unavailable for this
                assessment.
              </Text>
            </View>
          )}

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
              style={[
                styles.galleryButton,
                themeStyles.surface,
              ]}
              onPress={uploadScreenshot}
            >
              <Ionicons
                name="images-outline"
                size={18}
                color="#A78BFA"
              />

              <Text
                style={[
                  styles.galleryButtonText,
                  themeStyles.accentText,
                ]}
              >
                Upload Screenshot
              </Text>
            </TouchableOpacity>
          </View>

          {/* IMAGE PREVIEW */}
          {selectedImage && (
            <View
              style={[
                styles.previewCard,
                themeStyles.surface,
              ]}
            >
              <Text
                style={[
                  styles.previewTitle,
                  themeStyles.text,
                ]}
              >
                Selected Image
              </Text>

              <Image
                source={{ uri: selectedImage }}
                style={[
                  styles.imagePreview,
                  {
                    backgroundColor:
                      colors.background,
                  },
                ]}
                resizeMode="contain"
              />

              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  setSelectedImage(null);
                  setSelectedImageType(null);
                }}
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
              (
                !selectedImage ||
                analysing ||
                !canUseAI
              ) && styles.disabledButton,
            ]}
            onPress={analyzeImage}
            disabled={
              !selectedImage ||
              analysing ||
              !canUseAI
            }
          >
            <Ionicons
              name={
                canUseAI
                  ? "sparkles-outline"
                  : "lock-closed-outline"
              }
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.analyzeButtonText}>
              {!canUseAI
                ? "AI Analysis Disabled"
                : analysing
                  ? "Analysing..."
                  : "Analyze Image with AI"}
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.cameraNote,
              themeStyles.secondary,
            ]}
          >
            {canUseAI
              ? "Take a clear, well-lit photo. The AI explanation will appear in the Output section."
              : "You can take or upload a photo, but AI analysis is unavailable for this assessment."}
          </Text>

          {/* OUTPUT */}
          <Text
            style={[
              styles.sectionTitle,
              themeStyles.text,
            ]}
          >
            Output
          </Text>

          <View
            style={[
              styles.outputCard,
              themeStyles.surface,
              themeStyles.border,
            ]}
          >
            <Text
              style={[
                styles.outputLabel,
                themeStyles.secondary,
              ]}
            >
              CONSOLE
            </Text>

            <Text
              style={[
                styles.outputText,
                themeStyles.text,
              ]}
            >
              {output}
            </Text>
          </View>

          {/* SUBMIT ASSESSMENT */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (
                submitting ||
                !canSubmitAssessment
              ) && styles.disabledButton,
            ]}
            onPress={submitCode}
            disabled={
              submitting ||
              !canSubmitAssessment
            }
          >
            <Ionicons
              name="cloud-upload-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.submitButtonText}>
              {submitting
                ? "Submitting..."
                : "Submit Code"}
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.footerNote,
              themeStyles.secondary,
            ]}
          >
            {isStandalone
              ? "Practice mode: open an assessment to submit your code."
              : "Review your code carefully before submitting."}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 23,
    fontWeight: "bold",
  },

  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  questionCard: {
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
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 12,
  },

  questionText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 13,
  },

  questionNote: {
    color: "#A78BFA",
    fontSize: 12,
    marginTop: 12,
  },

  retryButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    gap: 7,
    marginTop: 5,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  editorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  languageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  languageText: {
    fontSize: 12,
    fontWeight: "bold",
  },

  languageMenu: {
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
  },

  languageOptionText: {
    fontSize: 14,
  },

  editorContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },

  editorToolbar: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  fileName: {
    fontSize: 13,
    fontWeight: "600",
  },

  editorStatus: {
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
    alignItems: "flex-end",
  },

  lineNumber: {
    fontSize: 13,
    lineHeight: 22,
    fontFamily: "monospace",
  },

  codeInput: {
    flex: 1,
    minHeight: 260,
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
    fontSize: 14,
    fontWeight: "bold",
  },

  disabledButton: {
    opacity: 0.45,
  },

  aiDisabledNotice: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  aiDisabledText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  cameraDescription: {
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
    fontSize: 12,
    fontWeight: "bold",
  },

  previewCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },

  previewTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
  },

  imagePreview: {
    width: "100%",
    height: 260,
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

  analyzeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },

  cameraNote: {
    fontSize: 12,
    marginBottom: 28,
    lineHeight: 18,
  },

  outputCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 17,
    minHeight: 110,
    marginBottom: 25,
  },

  outputLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 12,
  },

  outputText: {
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
    fontSize: 11,
    textAlign: "center",
    marginTop: 12,
  },
});
