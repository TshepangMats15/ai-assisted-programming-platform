// DevMate Student Assessment Details Screen

import React, {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  router,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

import api, {
  AssessmentDTO,
  QuestionDTO,
  SubmissionRecord,
} from "../constants/api";

import { useAppTheme } from "../context/ThemeContext";

export default function AssessmentDetailsScreen() {
  const { colors, isDark } = useAppTheme();

  const { assessmentId, courseID, submissionId } =
    useLocalSearchParams<{
      assessmentId?: string;
      assessmentTitle?: string;
      language?: string;
      courseID?: string;
      submissionId?: string;
    }>();

  const purple = "#8B5CF6";

  const purpleText = isDark
    ? "#A78BFA"
    : "#6D28D9";

  // =======================================================
  // STATE
  // =======================================================

  const [assessment, setAssessment] =
    useState<AssessmentDTO | null>(null);

  const [questions, setQuestions] =
    useState<QuestionDTO[]>([]);

  const [draft, setDraft] = useState<SubmissionRecord | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const mutation = useRef(false);
  const locked = !!draft && draft.status !== "DRAFT";
  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // =======================================================
  // ASSESSMENT ID
  // =======================================================

  const parsedAssessmentId =
    typeof assessmentId === "string"
      ? Number(assessmentId)
      : NaN;

  const validAssessmentId =
    Number.isSafeInteger(parsedAssessmentId) &&
    parsedAssessmentId > 0;

  // =======================================================
  // LOAD ASSESSMENT
  // =======================================================

  const loadAssessment =
    useCallback(async () => {
      try {
        setError(null);

        if (!validAssessmentId) {
          throw new Error(
            "No valid assessment was selected. Please return to the course and select an assessment."
          );
        }

        /*
         * Load the assessment and all of its
         * questions from Spring Boot.
         */
        const [
          assessmentData,
          questionData,
        ] = await Promise.all([
          api.assessments.getById(
            parsedAssessmentId
          ),

          api.assessments.getQuestions(
            parsedAssessmentId
          ),
        ]);

        const record = submissionId ? await api.submissions.getById(Number(submissionId)) : await api.submissions.getCurrentAttempt(parsedAssessmentId);
        if (record && record.assessment?.assessmentID !== parsedAssessmentId) throw new Error("Submission does not belong to this assessment.");
        const savedAnswers = record ? await api.submissions.getAnswers(record.submissionId) : {};
        setDraft(record);
        setAnswers(savedAnswers);
        setAssessment(assessmentData);

        setQuestions(
          Array.isArray(questionData)
            ? questionData
            : []
        );
      } catch (err: any) {
        console.error(
          "[Assessment Details] Failed to load assessment:",
          err
        );

        setAssessment(null);
        setQuestions([]);

        setError(
          err?.message ||
            "Unable to load this assessment. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }, [
      parsedAssessmentId,
      validAssessmentId,
      submissionId,
    ]);

  useFocusEffect(useCallback(() => { void loadAssessment(); }, [loadAssessment]));

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh =
    useCallback(async () => {
      setRefreshing(true);

      try {
        await loadAssessment();
      } finally {
        setRefreshing(false);
      }
    }, [loadAssessment]);

  // =======================================================
  // RETRY
  // =======================================================

  const handleRetry = async () => {
    setLoading(true);

    await loadAssessment();
  };

  // =======================================================
  // OPEN CODING QUESTION
  // =======================================================

  
const openCodingQuestion = (
  question: QuestionDTO
) => {
  if (busy || locked) return;
  // The route assessmentId is already validated
  // when this screen loads.
  if (!validAssessmentId || !assessment) {
    Alert.alert(
      "Assessment Unavailable",
      "Please reload the assessment and try again."
    );
    return;
  }

  if (
    question.questionType?.toUpperCase() !==
    "CODING_CHALLENGE"
  ) {
    Alert.alert(
      "Invalid Question",
      "This question is not a coding challenge."
    );
    return;
  }

  if (
    !question.questionID ||
    !question.questionID.trim()
  ) {
    Alert.alert(
      "Question Unavailable",
      "This coding challenge does not have a valid question ID."
    );
    return;
  }

  // Prefer the backend assessment ID, but fall
  // back to the valid ID used to load this screen.
  const idToOpen =
    assessment.assessmentID != null &&
    Number.isSafeInteger(
      Number(assessment.assessmentID)
    ) &&
    Number(assessment.assessmentID) > 0
      ? Number(assessment.assessmentID)
      : parsedAssessmentId;

  router.push({
    pathname: "/coding-workspace",
    params: {
      assessmentId: String(idToOpen),
      questionID: question.questionID,
      ...(draft ? { submissionId: String(draft.submissionId) } : {}),
      language: assessment.programLang || "",
      courseID:
        typeof courseID === "string"
          ? courseID
          : "",
    },
  });
};

  function optionsFor(q: QuestionDTO): string[] {
    try { const data = JSON.parse(q.optionsJson ?? "[]"); return Array.isArray(data) ? data.filter((v): v is string => typeof v === "string") : []; } catch { return []; }
  }
  async function selectAnswer(q: QuestionDTO, answer: string) {
    if (mutation.current || locked) return;
    mutation.current = true; setBusy(true);
    try {
      const id = draft?.submissionId ?? (await api.submissions.createDraft(parsedAssessmentId)).submissionId;
      const record = await api.submissions.getById(id);
      setDraft(record);
      setAnswers(await api.submissions.saveAnswers(id, { [q.questionID]: answer }));
    } catch (e) { Alert.alert("Unable to save answer", e instanceof Error ? e.message : "Try again."); }
    finally { mutation.current = false; setBusy(false); }
  }
  const ready = questions.length > 0 && !!draft && questions.every(q => q.questionType === "MULTIPLE_CHOICE" ? optionsFor(q).includes(answers[q.questionID]) : q.questionType === "CODING_CHALLENGE" && !!draft.sourceCode?.trim());
  async function finishAssessment() {
    if (!draft || mutation.current) return;
    mutation.current = true; setBusy(true);
    try {
      const record = locked ? draft : await api.submissions.finalize(draft.submissionId);
      setDraft(record);
      const result = await api.submissions.gradeSubmission(record.submissionId);
      setDraft(await api.submissions.getById(record.submissionId));
      Alert.alert("Assessment graded", result.message);
    } catch (e) {
      try { setDraft(await api.submissions.getById(draft.submissionId)); } catch { /* keep last known state */ }
      Alert.alert("Assessment update", e instanceof Error ? e.message : "Try again from submission history.");
    } finally { mutation.current = false; setBusy(false); }
  }

  // =======================================================
  // HELPERS
  // =======================================================

  const formatAssessmentType = (
    type?: string
  ): string => {
    if (!type) {
      return "Assessment";
    }

    switch (type.toUpperCase()) {
      case "PRE_TEST":
        return "Pre-Assessment";

      case "POST_TEST":
        return "Post-Assessment";

      default:
        return type
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(
            /\b\w/g,
            (letter) =>
              letter.toUpperCase()
          );
    }
  };

  const formatQuestionType = (
    type?: string
  ): string => {
    if (!type) {
      return "Question";
    }

    switch (type.toUpperCase()) {
      case "MULTIPLE_CHOICE":
        return "Multiple Choice";

      case "CODING_CHALLENGE":
        return "Coding Challenge";

      default:
        return type
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(
            /\b\w/g,
            (letter) =>
              letter.toUpperCase()
          );
    }
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <View
          style={styles.centerState}
        >
          <ActivityIndicator
            size="large"
            color={purple}
          />

          <Text
            style={[
              styles.stateTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Loading assessment
          </Text>

          <Text
            style={[
              styles.stateDescription,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Retrieving assessment
            details and questions.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error || !assessment) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <View
          style={styles.errorHeader}
        >
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor:
                  colors.backgroundElement,
              },
            ]}
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <View
          style={styles.centerState}
        >
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={purple}
          />

          <Text
            style={[
              styles.stateTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Unable to load assessment
          </Text>

          <Text
            style={[
              styles.stateDescription,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {error ||
              "Assessment information is unavailable."}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.retryButtonText
              }
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // =======================================================
  // SCREEN
  // =======================================================

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={purple}
            colors={[purple]}
          />
        }
      >
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor:
                  colors.backgroundElement,
              },
            ]}
            onPress={() =>
              router.back()
            }
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          <View
            style={styles.headerText}
          >
            <Text
              style={[
                styles.headerTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Assessment Details
            </Text>

            <Text
              style={[
                styles.headerSubtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {assessment.programLang
                ? `${assessment.programLang} Programming`
                : formatAssessmentType(
                    assessment.assessmentType
                  )}
            </Text>
          </View>
        </View>

        {/* ================= TITLE ================= */}

        <View
          style={[
            styles.titleCard,
            {
              backgroundColor:
                colors.backgroundElement,

              borderColor:
                colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.activeBadge,
              {
                backgroundColor:
                  isDark
                    ? "#2D2140"
                    : "#EDE9FE",
              },
            ]}
          >
            <Text
              style={[
                styles.activeBadgeText,
                {
                  color: purpleText,
                },
              ]}
            >
              {formatAssessmentType(
                assessment.assessmentType
              ).toUpperCase()}
            </Text>
          </View>

          <Text
            style={[
              styles.assessmentTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {assessment.title}
          </Text>

          {assessment.description ? (
            <Text
              style={[
                styles.assessmentDescription,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {
                assessment.description
              }
            </Text>
          ) : null}
        </View>

        {/* ================= INFORMATION ================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Assessment Information
        </Text>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor:
                colors.backgroundElement,

              borderColor:
                colors.border,
            },
          ]}
        >
          <InfoRow
            label="Assessment Type"
            value={formatAssessmentType(
              assessment.assessmentType
            )}
            labelColor={
              colors.textSecondary
            }
            valueColor={colors.text}
          />

          <Divider
            color={colors.border}
          />

          <InfoRow
            label="Language"
            value={
              assessment.programLang ||
              "Not specified"
            }
            labelColor={
              colors.textSecondary
            }
            valueColor={colors.text}
          />

          <Divider
            color={colors.border}
          />

          <InfoRow
            label="Time Limit"
            value={
              assessment.timeLimit != null
                ? `${assessment.timeLimit} minutes`
                : "Not specified"
            }
            labelColor={
              colors.textSecondary
            }
            valueColor={colors.text}
          />

          <Divider
            color={colors.border}
          />

          <InfoRow
            label="Questions"
            value={String(
              questions.length
            )}
            labelColor={
              colors.textSecondary
            }
            valueColor={colors.text}
          />

          <Divider
            color={colors.border}
          />

          <InfoRow
            label="AI Assistance"
            value={
              assessment.aiAllowed
                ? "Allowed"
                : "Not Allowed"
            }
            labelColor={
              colors.textSecondary
            }
            valueColor={
              assessment.aiAllowed
                ? "#4ADE80"
                : colors.textSecondary
            }
          />
        </View>

        {/* ================= QUESTIONS ================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Assessment Questions
        </Text>

        {questions.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor:
                  colors.backgroundElement,

                borderColor:
                  colors.border,
              },
            ]}
          >
            <Ionicons
              name="help-circle-outline"
              size={36}
              color={purple}
            />

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              No questions available
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              No questions have been
              added to this assessment
              yet.
            </Text>
          </View>
        ) : (
          questions.map(
            (question, index) => {
              const isCodingQuestion =
                question.questionType?.toUpperCase() ===
                "CODING_CHALLENGE";

              return (
                <View
                  key={
                    question.questionID
                  }
                  style={[
                    styles.questionCard,
                    {
                      backgroundColor:
                        colors.backgroundElement,

                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  {/* QUESTION HEADER */}

                  <View
                    style={
                      styles.questionHeader
                    }
                  >
                    <View
                      style={[
                        styles.questionNumber,
                        {
                          backgroundColor:
                            isDark
                              ? "#2D2140"
                              : "#EDE9FE",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.questionNumberText,
                          {
                            color:
                              purpleText,
                          },
                        ]}
                      >
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.questionHeading
                      }
                    >
                      <Text
                        style={[
                          styles.questionType,
                          {
                            color:
                              purpleText,
                          },
                        ]}
                      >
                        {formatQuestionType(
                          question.questionType
                        )}
                      </Text>

                      <Text
                        style={[
                          styles.questionLabel,
                          {
                            color:
                              colors.textSecondary,
                          },
                        ]}
                      >
                        Question{" "}
                        {index + 1}
                      </Text>
                    </View>
                  </View>

                  {/* QUESTION PROMPT */}

                  <Text
                    style={[
                      styles.questionPrompt,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {question.prompt}
                  </Text>

                  {/* CODING CHALLENGE BUTTON */}

                  {isCodingQuestion ? (
                    <TouchableOpacity
                      style={
                        styles.openQuestionButton
                      }
                      onPress={() =>
                        openCodingQuestion(
                          question
                        )
                      }
                      accessibilityRole="button"
                      disabled={busy || locked}
                    >
                      <Text
                        style={
                          styles.openQuestionButtonText
                        }
                      >
                        {locked ? "Code locked" : draft?.sourceCode?.trim() ? "Edit Saved Code" : "Open Coding Challenge"}
                      </Text>

                      <Ionicons
                        name="code-slash-outline"
                        size={17}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  ) : question.questionType === "MULTIPLE_CHOICE" ? (
                    <View style={{ marginTop: 12, gap: 8 }}>
                      {optionsFor(question).map((option, i) => (
                        <TouchableOpacity key={i} disabled={busy || locked} onPress={() => void selectAnswer(question, option)} accessibilityRole="radio" accessibilityState={{ checked: answers[question.questionID] === option, disabled: busy || locked }} style={{ borderWidth: 1, borderColor: answers[question.questionID] === option ? purple : colors.border, borderRadius: 9, padding: 12, flexDirection: "row", gap: 8 }}>
                          <Ionicons name={answers[question.questionID] === option ? "radio-button-on" : "radio-button-off"} size={19} color={purple} />
                          <Text style={{ color: colors.text, flex: 1 }}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                      {!optionsFor(question).length && <Text style={{ color: colors.textSecondary }}>No valid options available.</Text>}
                    </View>
                  ) : <Text style={{ color: colors.textSecondary }}>Unsupported question type.</Text>}
                </View>
              );
            }
          )
        )}

        {/* ================= INSTRUCTIONS ================= */}

        <Text
          style={[
            styles.sectionTitle,
            styles.sectionSpacing,
            {
              color: colors.text,
            },
          ]}
        >
          Instructions
        </Text>

        <View
          style={[
            styles.instructionsCard,
            {
              backgroundColor:
                colors.backgroundElement,

              borderColor:
                colors.border,
            },
          ]}
        >
          <InstructionRow
            text="Read each assessment question carefully before starting."
            color={
              colors.textSecondary
            }
          />

          <InstructionRow
            text="Use the programming language specified for the assessment where required."
            color={
              colors.textSecondary
            }
          />

          <InstructionRow
            text="Review and test your solution before submitting."
            color={
              colors.textSecondary
            }
          />

          <InstructionRow
            text="Make sure your final submission represents your own work."
            color={
              colors.textSecondary
            }
          />
        </View>

        {/* ================= AI STATUS ================= */}

        <View
          style={[
            styles.aiCard,
            {
              backgroundColor:
                isDark
                  ? "#17131F"
                  : "#F5F3FF",

              borderColor:
                isDark
                  ? "#2D2140"
                  : "#DDD6FE",
            },
          ]}
        >
          <View
            style={
              styles.aiIcon
            }
          >
            <Text
              style={
                styles.aiIconText
              }
            >
              AI
            </Text>
          </View>

          <View
            style={
              styles.aiContent
            }
          >
            <Text
              style={[
                styles.aiTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {assessment.aiAllowed
                ? "AI Assistance Available"
                : "AI Assistance Disabled"}
            </Text>

            <Text
              style={[
                styles.aiDescription,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {assessment.aiAllowed
                ? "DevMate AI assistance is enabled for this assessment."
                : "AI assistance is disabled for this assessment."}
            </Text>
          </View>
        </View>

        <Text style={{ color: colors.text, marginBottom: 10 }}>Status: {draft?.status ?? "Not started"}{draft?.score != null ? ` • ${draft.score}%` : ""}</Text>
        {draft?.status !== "GRADED" && <TouchableOpacity style={[styles.openQuestionButton, { opacity: busy || (!locked && !ready) ? 0.5 : 1 }]} disabled={busy || (!locked && !ready)} onPress={() => locked ? void finishAssessment() : Alert.alert("Submit assessment?", "Your answers and code will be locked.", [{ text: "Cancel", style: "cancel" }, { text: "Submit", onPress: () => void finishAssessment() }])}><Text style={styles.openQuestionButtonText}>{busy ? "Please wait..." : locked ? "Check / Retry Grading" : "Submit Assessment"}</Text></TouchableOpacity>}


        <Text
          style={[
            styles.footerText,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          Select a coding challenge
          above to open the Coding
          Workspace.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// =========================================================
// INFO ROW
// =========================================================

function InfoRow({
  label,
  value,
  labelColor,
  valueColor,
}: {
  label: string;
  value: string;
  labelColor: string;
  valueColor: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text
        style={[
          styles.infoLabel,
          {
            color: labelColor,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.infoValue,
          {
            color: valueColor,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// =========================================================
// DIVIDER
// =========================================================

function Divider({
  color,
}: {
  color: string;
}) {
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color,
        },
      ]}
    />
  );
}

// =========================================================
// INSTRUCTION ROW
// =========================================================

function InstructionRow({
  text,
  color,
}: {
  text: string;
  color: string;
}) {
  return (
    <View
      style={
        styles.instructionRow
      }
    >
      <Ionicons
        name="checkmark-circle-outline"
        size={17}
        color="#8B5CF6"
      />

      <Text
        style={[
          styles.instruction,
          {
            color,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 45,
  },

  // =======================================================
  // HEADER
  // =======================================================

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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },

  headerSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },

  errorHeader: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  // =======================================================
  // TITLE
  // =======================================================

  titleCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 28,
  },

  activeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },

  activeBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
  },

  assessmentTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },

  assessmentDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },

  // =======================================================
  // SECTIONS
  // =======================================================

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  sectionSpacing: {
    marginTop: 28,
  },

  // =======================================================
  // INFORMATION
  // =======================================================

  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 17,
    marginBottom: 28,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },

  infoLabel: {
    fontSize: 13,
    flex: 1,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },

  divider: {
    height: 1,
    marginVertical: 11,
  },

  // =======================================================
  // QUESTIONS
  // =======================================================

  questionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  questionNumber: {
    width: 38,
    height: 38,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  questionNumberText: {
    fontSize: 11,
    fontWeight: "bold",
  },

  questionHeading: {
    flex: 1,
  },

  questionType: {
    fontSize: 11,
    fontWeight: "bold",
  },

  questionLabel: {
    fontSize: 10,
    marginTop: 3,
  },

  questionPrompt: {
    fontSize: 13,
    lineHeight: 20,
  },

  // =======================================================
  // OPEN CODING QUESTION
  // =======================================================

  openQuestionButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  openQuestionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  nonCodingNotice: {
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  nonCodingText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
  },

  // =======================================================
  // EMPTY
  // =======================================================

  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 10,
  },

  emptyDescription: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
  },

  // =======================================================
  // INSTRUCTIONS
  // =======================================================

  instructionsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },

  instructionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  instruction: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 9,
  },

  // =======================================================
  // AI
  // =======================================================

  aiCard: {
    borderWidth: 1,
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
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },

  aiDescription: {
    fontSize: 12,
    lineHeight: 18,
  },

  // =======================================================
  // FOOTER
  // =======================================================

  footerText: {
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 2,
  },

  // =======================================================
  // STATES
  // =======================================================

  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  stateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },

  stateDescription: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  retryButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});
