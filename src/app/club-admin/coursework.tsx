
import React, { useRef, useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import api, {
  AssessmentDTO,
  CourseworkDTO,
  request,
} from "../../constants/api";

// ======================================================
// THEME
// ======================================================

const COLORS = {
  background: "#0D0D0D",
  card: "#1A1A1A",
  input: "#292929",
  purple: "#8B5CF6",
  lightPurple: "#A78BFA",
  white: "#FFFFFF",
  grey: "#AAAAAA",
  red: "#FF6B6B",
  green: "#4ADE80",
  border: "#333333",
};

const LANGUAGES = [
  "Java",
  "C++",
  "Python",
  "HTML/CSS",
  "JavaScript",
  "C#",
];

const DIFFICULTIES = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const STEPS = [
  "Course",
  "Pre-test",
  "Lessons",
  "Post-test",
];

// ======================================================
// TYPES
// ======================================================

type AssessmentType = "PRE_TEST" | "POST_TEST";

type LessonType = "READING" | "VIDEO" | "CODE_LAB";

type TestCase = {
  id: string;
  inputData: string;
  expectedOutput: string;
};

type Question = {
  id: string;
  questionType: "MULTIPLE_CHOICE" | "CODING_CHALLENGE";
  prompt: string;
  options: string[];
  correctIndex: number;
  starterCode: string;
  testCases: TestCase[];
};

type AssessmentForm = {
  title: string;
  description: string;
  difficulty: string;
  timeLimit: string;
  aiAllowed: boolean;
  questions: Question[];
};

type LessonForm = {
  id: string;
  title: string;
  contentType: LessonType;
  explanation: string;
  resources: string;
};

type CourseForm = {
  courseID: string;
  title: string;
  module: string;
  description: string;
  dueDate: string;
  createdBy: string;
  language: string;
};

let sequence = 0;

function newID() {
  sequence += 1;
  return `${Date.now()}-${sequence}`;
}

function newTestCase(): TestCase {
  return {
    id: newID(),
    inputData: "",
    expectedOutput: "",
  };
}

function newQuestion(
  type: Question["questionType"]
): Question {
  return {
    id: newID(),
    questionType: type,
    prompt: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    starterCode: "",
    testCases: [newTestCase()],
  };
}

function newAssessment(
  aiAllowed: boolean
): AssessmentForm {
  return {
    title: "",
    description: "",
    difficulty: "Beginner",
    timeLimit: "15",
    aiAllowed,
    questions: [],
  };
}

function newLesson(): LessonForm {
  return {
    id: newID(),
    title: "",
    contentType: "READING",
    explanation: "",
    resources: "",
  };
}

// ======================================================
// REUSABLE UI COMPONENTS
// ======================================================

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numeric?: boolean;
  editable?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numeric = false,
  editable = true,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          !editable && styles.disabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#777777"
        multiline={multiline}
        textAlignVertical={
          multiline ? "top" : "center"
        }
        keyboardType={
          numeric ? "number-pad" : "default"
        }
        editable={editable}
      />
    </View>
  );
}

function Choice({
  label,
  selected,
  onPress,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.choice,
        selected && styles.selectedChoice,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.choiceText,
          selected && styles.selectedChoiceText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type ActionProps = {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  outline?: boolean;
  disabled?: boolean;
};

function Action({
  label,
  icon,
  onPress,
  outline = false,
  disabled = false,
}: ActionProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        outline && styles.outlineButton,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={19}
          color={
            outline
              ? COLORS.lightPurple
              : COLORS.white
          }
        />
      )}

      <Text
        style={[
          styles.buttonText,
          outline && styles.outlineText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ======================================================
// ASSESSMENT FORM
// ======================================================

function AssessmentFormSection({
  assessment,
  type,
  language,
  onChange,
  disabled,
}: {
  assessment: AssessmentForm;
  type: AssessmentType;
  language: string;
  onChange: (value: AssessmentForm) => void;
  disabled: boolean;
}) {
  const isPre = type === "PRE_TEST";

  function update(
    patch: Partial<AssessmentForm>
  ) {
    onChange({
      ...assessment,
      ...patch,
    });
  }

  function updateQuestion(
    id: string,
    patch: Partial<Question>
  ) {
    update({
      questions: assessment.questions.map(
        (question) =>
          question.id === id
            ? { ...question, ...patch }
            : question
      ),
    });
  }

  function addQuestion(
    questionType: Question["questionType"]
  ) {
    update({
      questions: [
        ...assessment.questions,
        newQuestion(questionType),
      ],
    });
  }

  function removeQuestion(id: string) {
    update({
      questions: assessment.questions.filter(
        (question) => question.id !== id
      ),
    });
  }

  const hasCoding = assessment.questions.some(
    (question) =>
      question.questionType === "CODING_CHALLENGE"
  );

  return (
    <View>
      <View style={styles.card}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}>
            <Ionicons
              name={
                isPre
                  ? "clipboard-outline"
                  : "trophy-outline"
              }
              size={25}
              color={COLORS.lightPurple}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>
              {isPre
                ? "Pre-assessment"
                : "Post-assessment"}
            </Text>

            <Text style={styles.muted}>
              {type} · {language}
            </Text>
          </View>
        </View>

        <Text style={styles.helper}>
          {isPre
            ? "Measure students' existing knowledge before completing the lessons."
            : "Measure students' understanding after completing the lessons."}
        </Text>

        <Field
          label="Assessment Title"
          value={assessment.title}
          onChangeText={(title) =>
            update({ title })
          }
          placeholder={
            isPre
              ? `${language} Diagnostic Assessment`
              : `${language} Final Assessment`
          }
          editable={!disabled}
        />

        <Field
          label="Assessment Instructions"
          value={assessment.description}
          onChangeText={(description) =>
            update({ description })
          }
          placeholder="Explain what students must complete."
          multiline
          editable={!disabled}
        />

        <Text style={styles.label}>
          Difficulty
        </Text>

        <View style={styles.choiceRow}>
          {DIFFICULTIES.map((difficulty) => (
            <Choice
              key={difficulty}
              label={difficulty}
              selected={
                assessment.difficulty === difficulty
              }
              onPress={() =>
                update({ difficulty })
              }
              disabled={disabled}
            />
          ))}
        </View>

        <Field
          label="Time Limit (Minutes)"
          value={assessment.timeLimit}
          onChangeText={(timeLimit) =>
            update({ timeLimit })
          }
          placeholder="15"
          numeric
          editable={!disabled}
        />

        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles-outline"
              size={24}
              color={COLORS.lightPurple}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>
              AI Assistance
            </Text>

            <Text style={styles.aiDescription}>
              {assessment.aiAllowed
                ? "Students may use AI assistance."
                : "AI assistance is disabled."}
            </Text>
          </View>

          <Switch
            value={assessment.aiAllowed}
            onValueChange={(aiAllowed) =>
              update({ aiAllowed })
            }
            trackColor={{
              false: "#444444",
              true: COLORS.purple,
            }}
            thumbColor="#FFFFFF"
            disabled={disabled}
          />
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>
          Assessment Questions
        </Text>

        <Text style={styles.counter}>
          {assessment.questions.length}
        </Text>
      </View>

      {assessment.questions.length === 0 && (
        <View style={styles.emptyCard}>
          <Ionicons
            name="help-circle-outline"
            size={38}
            color={COLORS.lightPurple}
          />

          <Text style={styles.cardTitle}>
            No questions added
          </Text>

          <Text style={styles.helper}>
            Add multiple-choice questions or a
            coding challenge below.
          </Text>
        </View>
      )}

      {assessment.questions.map(
        (question, index) => (
          <View
            key={question.id}
            style={styles.card}
          >
            <View style={styles.listHeader}>
              <Text style={styles.cardTitle}>
                Question {index + 1}
              </Text>

              <TouchableOpacity
                disabled={disabled}
                onPress={() =>
                  removeQuestion(question.id)
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color={COLORS.red}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {question.questionType ===
                "MULTIPLE_CHOICE"
                  ? "Multiple Choice"
                  : "Coding Challenge"}
              </Text>
            </View>

            <Field
              label="Question Prompt"
              value={question.prompt}
              onChangeText={(prompt) =>
                updateQuestion(question.id, {
                  prompt,
                })
              }
              placeholder="Enter the question."
              multiline
              editable={!disabled}
            />

            {question.questionType ===
            "MULTIPLE_CHOICE" ? (
              <>
                <Text style={styles.label}>
                  Answer Options
                </Text>

                <Text style={styles.helper}>
                  Select the circle next to the
                  correct answer.
                </Text>

                {question.options.map(
                  (option, optionIndex) => (
                    <View
                      key={optionIndex}
                      style={[
                        styles.optionRow,
                        question.correctIndex ===
                          optionIndex &&
                          styles.correctOption,
                      ]}
                    >
                      <TouchableOpacity
                        disabled={disabled}
                        onPress={() =>
                          updateQuestion(
                            question.id,
                            {
                              correctIndex:
                                optionIndex,
                            }
                          )
                        }
                      >
                        <Ionicons
                          name={
                            question.correctIndex ===
                            optionIndex
                              ? "radio-button-on"
                              : "radio-button-off"
                          }
                          size={25}
                          color={
                            question.correctIndex ===
                            optionIndex
                              ? COLORS.green
                              : COLORS.grey
                          }
                        />
                      </TouchableOpacity>

                      <Text style={styles.optionLetter}>
                        {String.fromCharCode(
                          65 + optionIndex
                        )}
                      </Text>

                      <TextInput
                        style={styles.optionInput}
                        value={option}
                        placeholder={`Option ${String.fromCharCode(
                          65 + optionIndex
                        )}`}
                        placeholderTextColor="#777777"
                        editable={!disabled}
                        onChangeText={(value) =>
                          updateQuestion(
                            question.id,
                            {
                              options:
                                question.options.map(
                                  (existing, i) =>
                                    i === optionIndex
                                      ? value
                                      : existing
                                ),
                            }
                          )
                        }
                      />
                    </View>
                  )
                )}

                <View style={styles.correctNotice}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    color={COLORS.green}
                    size={19}
                  />

                  <Text style={styles.correctText}>
                    Correct answer:{" "}
                    {String.fromCharCode(
                      65 + question.correctIndex
                    )}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Field
                  label="Starter Code"
                  value={question.starterCode}
                  onChangeText={(starterCode) =>
                    updateQuestion(question.id, {
                      starterCode,
                    })
                  }
                  placeholder="Enter optional starter code."
                  multiline
                  editable={!disabled}
                />

                <Text style={styles.sectionTitle}>
                  Test Cases
                </Text>

                <Text style={styles.helper}>
                  Test cases are used to grade
                  student code automatically.
                </Text>

                {question.testCases.map(
                  (testCase, caseIndex) => (
                    <View
                      key={testCase.id}
                      style={styles.testCaseCard}
                    >
                      <View style={styles.listHeader}>
                        <Text style={styles.cardTitle}>
                          Test Case {caseIndex + 1}
                        </Text>

                        <TouchableOpacity
                          disabled={disabled}
                          onPress={() =>
                            updateQuestion(
                              question.id,
                              {
                                testCases:
                                  question.testCases.filter(
                                    (item) =>
                                      item.id !==
                                      testCase.id
                                  ),
                              }
                            )
                          }
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color={COLORS.red}
                          />
                        </TouchableOpacity>
                      </View>

                      <Field
                        label="Input Data"
                        value={testCase.inputData}
                        placeholder="Example: 10"
                        multiline
                        editable={!disabled}
                        onChangeText={(inputData) =>
                          updateQuestion(
                            question.id,
                            {
                              testCases:
                                question.testCases.map(
                                  (item) =>
                                    item.id ===
                                    testCase.id
                                      ? {
                                          ...item,
                                          inputData,
                                        }
                                      : item
                                ),
                            }
                          )
                        }
                      />

                      <Field
                        label="Expected Output"
                        value={
                          testCase.expectedOutput
                        }
                        placeholder="Example: Even"
                        multiline
                        editable={!disabled}
                        onChangeText={(
                          expectedOutput
                        ) =>
                          updateQuestion(
                            question.id,
                            {
                              testCases:
                                question.testCases.map(
                                  (item) =>
                                    item.id ===
                                    testCase.id
                                      ? {
                                          ...item,
                                          expectedOutput,
                                        }
                                      : item
                                ),
                            }
                          )
                        }
                      />
                    </View>
                  )
                )}

                <Action
                  label="Add Test Case"
                  icon="add-circle-outline"
                  outline
                  disabled={disabled}
                  onPress={() =>
                    updateQuestion(question.id, {
                      testCases: [
                        ...question.testCases,
                        newTestCase(),
                      ],
                    })
                  }
                />
              </>
            )}
          </View>
        )
      )}

      <Action
        label="Add Multiple-Choice Question"
        icon="add-circle-outline"
        outline
        disabled={disabled}
        onPress={() =>
          addQuestion("MULTIPLE_CHOICE")
        }
      />

      <Action
        label={
          hasCoding
            ? "Coding Challenge Added"
            : "Add Coding Challenge"
        }
        icon="code-slash-outline"
        outline
        disabled={disabled || hasCoding}
        onPress={() =>
          addQuestion("CODING_CHALLENGE")
        }
      />

      <Text style={styles.helper}>
        One coding challenge is permitted per
        assessment to match the current grading system.
      </Text>
    </View>
  );
}

// ======================================================
// MAIN COURSE CREATION SCREEN
// ======================================================

export default function ManageCourseworkScreen() {
  const [step, setStep] = useState(0);

  const [course, setCourse] =
    useState<CourseForm>({
      courseID: "",
      title: "",
      module: "",
      description: "",
      dueDate: "",
      createdBy: "",
      language: "Java",
    });

  const [preAssessment, setPreAssessment] =
    useState<AssessmentForm>(
      () => newAssessment(false)
    );

  const [postAssessment, setPostAssessment] =
    useState<AssessmentForm>(
      () => newAssessment(true)
    );

  const [lessons, setLessons] =
    useState<LessonForm[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveStarted, setSaveStarted] =
    useState(false);
  const [saveMessage, setSaveMessage] =
    useState("");
  const [error, setError] = useState("");

  const saveLock = useRef(false);

  // Tracks confirmed writes during this screen session.
  const saved = useRef({
    course: false,
    pre: false,
    post: false,
    lessons: [] as string[],
  });

  const scrollRef = useRef<
  React.ComponentRef<typeof ScrollView>
>(null);

  const language = course.language;

  function updateCourse(
    key: keyof CourseForm,
    value: string
  ) {
    setCourse((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function updateLesson(
    id: string,
    patch: Partial<LessonForm>
  ) {
    setLessons((previous) =>
      previous.map((lesson) =>
        lesson.id === id
          ? { ...lesson, ...patch }
          : lesson
      )
    );
  }

  function changeStep(value: number) {
    setStep(value);

    scrollRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  }

  // ====================================================
  // VALIDATION
  // ====================================================

  function validDate(value: string) {
    if (!value) return true;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const [year, month, day] =
      value.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  function validateCourse(): string | null {
    if (
      !course.courseID.trim() ||
      !course.title.trim() ||
      !course.module.trim() ||
      !course.description.trim() ||
      !course.createdBy.trim()
    ) {
      return "Complete all required course information.";
    }

    if (
      !/^[A-Za-z0-9_-]{1,100}$/.test(
        course.courseID.trim()
      )
    ) {
      return "Course ID must contain only letters, numbers, hyphens or underscores.";
    }

    if (!validDate(course.dueDate.trim())) {
      return "Enter a valid due date in YYYY-MM-DD format.";
    }

    return null;
  }

  function validateAssessment(
    assessment: AssessmentForm
  ): string | null {
    if (
      !assessment.title.trim() ||
      !assessment.description.trim()
    ) {
      return "Enter the assessment title and instructions.";
    }

    const duration = Number(
      assessment.timeLimit
    );

    if (
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      return "Enter a positive whole number for the time limit.";
    }

    if (assessment.questions.length === 0) {
      return "Add at least one assessment question.";
    }

    for (
      let i = 0;
      i < assessment.questions.length;
      i++
    ) {
      const question = assessment.questions[i];

      if (!question.prompt.trim()) {
        return `Enter the prompt for Question ${
          i + 1
        }.`;
      }

      if (
        question.questionType ===
        "MULTIPLE_CHOICE"
      ) {
        if (
          question.options.some(
            (option) => !option.trim()
          )
        ) {
          return `Complete all options for Question ${
            i + 1
          }.`;
        }

        const normalized =
          question.options.map((option) =>
            option.trim().toLowerCase()
          );

        if (
          new Set(normalized).size !==
          normalized.length
        ) {
          return `Question ${
            i + 1
          } contains duplicate answer options.`;
        }
      } else {
        if (
          question.testCases.length === 0
        ) {
          return `Add a test case for Question ${
            i + 1
          }.`;
        }

        if (
          question.testCases.some(
            (testCase) =>
              !testCase.expectedOutput.trim()
          )
        ) {
          return `Enter the expected output for every test case in Question ${
            i + 1
          }.`;
        }
      }
    }

    return null;
  }

  function validateLessons(): string | null {
    if (lessons.length === 0) {
      return "Create at least one mini-lesson.";
    }

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];

      if (
        !lesson.title.trim() ||
        !lesson.explanation.trim()
      ) {
        return `Complete the title and explanation for Lesson ${
          i + 1
        }.`;
      }

      const links = lesson.resources
        .split("\n")
        .map((link) => link.trim())
        .filter(Boolean);

      if (
        links.some(
          (link) =>
            !/^https?:\/\/[^\s]+$/i.test(link)
        )
      ) {
        return `Lesson ${
          i + 1
        } contains an invalid resource URL.`;
      }
    }

    return null;
  }

  function validateStep(
    currentStep: number
  ): string | null {
    switch (currentStep) {
      case 0:
        return validateCourse();

      case 1:
        return validateAssessment(
          preAssessment
        );

      case 2:
        return validateLessons();

      case 3:
        return validateAssessment(
          postAssessment
        );

      default:
        return null;
    }
  }

  function continueForm() {
    const validation = validateStep(step);

    if (validation) {
      setError(validation);
      return;
    }

    setError("");

    if (step === 0) {
      setPreAssessment((previous) => ({
        ...previous,
        title:
          previous.title ||
          `${course.title.trim()} - Pre-assessment`,
      }));

      setPostAssessment((previous) => ({
        ...previous,
        title:
          previous.title ||
          `${course.title.trim()} - Post-assessment`,
      }));
    }

    changeStep(Math.min(3, step + 1));
  }

  function goBack() {
    if (saving) return;

    setError("");

    if (step > 0 && !saveStarted) {
      changeStep(step - 1);
      return;
    }

    Alert.alert(
      saveStarted
        ? "Leave Course Creation?"
        : "Discard New Course?",
      saveStarted
        ? "Some records may already be saved. Check Course Management before creating another course."
        : "Unsaved course information will be lost.",
      [
        {
          text: "Stay",
          style: "cancel",
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: () =>
            router.replace("/admin/courses"),
        },
      ]
    );
  }

  // ====================================================
  // ASSESSMENT API PAYLOAD
  // ====================================================

  function assessmentPayload(
    assessment: AssessmentForm,
    assessmentType: AssessmentType
  ) {
    return {
      courseID: course.courseID
        .trim()
        .toUpperCase(),

      title: assessment.title.trim(),
      description:
        assessment.description.trim(),

      difficulty: assessment.difficulty,
      programLang: course.language,
      timeLimit: Number(assessment.timeLimit),
      assessmentType,
      aiAllowed: assessment.aiAllowed,

      questions: assessment.questions.map(
        (question) => {
          if (
            question.questionType ===
            "MULTIPLE_CHOICE"
          ) {
            return {
              questionType:
                "MULTIPLE_CHOICE",
              prompt: question.prompt.trim(),

              options: question.options.map(
                (option) => option.trim()
              ),

              correctAnswer:
                question.options[
                  question.correctIndex
                ].trim(),
            };
          }

          return {
            questionType: "CODING_CHALLENGE",

            prompt: question.prompt.trim(),

            starterCode: question.starterCode,

            testCases: question.testCases.map(
              (testCase) => ({
                inputData: testCase.inputData,
                expectedOutput:
                  testCase.expectedOutput,
              })
            ),
          };
        }
      ),
    };
  }

  // ====================================================
  // SAVE COMPLETE COURSE
  // ====================================================

  async function saveCompleteCourse() {
    if (saveLock.current) return;

    for (let i = 0; i < 4; i++) {
      const validation = validateStep(i);

      if (validation) {
        changeStep(i);
        setError(validation);
        return;
      }
    }

    saveLock.current = true;
    setSaving(true);
    setError("");

    const courseID = course.courseID
      .trim()
      .toUpperCase();

    try {
      // STEP 1: CREATE COURSE

      if (!saved.current.course) {
        setSaveMessage(
          "Checking course information..."
        );

        const existing =
          await api.coursework.getAll();

        if (
          existing.some(
            (item) =>
              item.courseID.toUpperCase() ===
              courseID
          )
        ) {
          throw new Error(
            "This Course ID already exists. Check Course Management before retrying."
          );
        }

        const data: CourseworkDTO = {
          courseID,
          title: course.title.trim(),
          module: course.module.trim(),
          description: course.description.trim(),
          createdBy: course.createdBy.trim(),

          dueDate: course.dueDate.trim()
            ? `${course.dueDate.trim()}T00:00:00`
            : null,

          preAssessment: null,
          postAssessment: null,
        };

        setSaveStarted(true);

        setSaveMessage(
          "Saving course information..."
        );

        await api.coursework.create(data);

        saved.current.course = true;
      }

      // STEP 2: CREATE PRE-ASSESSMENT

      if (!saved.current.pre) {
        setSaveMessage(
          "Saving pre-assessment and questions..."
        );

        await request<AssessmentDTO>(
          "/assessments/complete",
          {
            method: "POST",
            body: JSON.stringify(
              assessmentPayload(
                preAssessment,
                "PRE_TEST"
              )
            ),
          }
        );

        saved.current.pre = true;
      }

      // STEP 3: CREATE ALL MINI-LESSONS

      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];

        const lessonID =
          `${courseID}-LES-${lesson.id}`;

        if (
          saved.current.lessons.includes(
            lessonID
          )
        ) {
          continue;
        }

        setSaveMessage(
          `Saving lesson ${i + 1} of ${
            lessons.length
          }...`
        );

        const resources = lesson.resources
          .split("\n")
          .map((link) => link.trim())
          .filter(Boolean);

        const contentBody = [
          lesson.explanation.trim(),
          resources.length
            ? `Resources:\n${resources.join(
                "\n"
              )}`
            : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        await api.lessons.create(courseID, {
          lessonID,
          title: lesson.title.trim(),
          contentType: lesson.contentType,
          contentBody,
        });

        saved.current.lessons.push(lessonID);
      }

      // STEP 4: CREATE POST-ASSESSMENT

      if (!saved.current.post) {
        setSaveMessage(
          "Saving post-assessment and questions..."
        );

        await request<AssessmentDTO>(
          "/assessments/complete",
          {
            method: "POST",
            body: JSON.stringify(
              assessmentPayload(
                postAssessment,
                "POST_TEST"
              )
            ),
          }
        );

        saved.current.post = true;
      }

      // STEP 5: VERIFY PERSISTENCE

      setSaveMessage(
        "Verifying saved course..."
      );

      const allCourses =
        await api.coursework.getAll();

      const createdCourse =
        allCourses.find(
          (item) => item.courseID === courseID
        );

      if (
        !createdCourse ||
        !createdCourse.preAssessment ||
        !createdCourse.postAssessment
      ) {
        throw new Error(
          "The course was not returned with both linked assessments. Check the backend."
        );
      }

      const createdLessons =
        await api.lessons.getByCourse(courseID);

      const expectedLessonIDs =
        lessons.map(
          (lesson) =>
            `${courseID}-LES-${lesson.id}`
        );

      if (
        !expectedLessonIDs.every((id) =>
          createdLessons.some(
            (lesson) => lesson.lessonID === id
          )
        )
      ) {
        throw new Error(
          "Not all lessons could be verified."
        );
      }

      setSaveMessage(
        "Course saved successfully."
      );

      Alert.alert(
        "Course Created",
        "The course, assessments, questions and lessons have been saved."
      );

      router.replace("/admin/courses");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to save the complete course.";

      setError(message);

      setSaveMessage(
        saved.current.course
          ? "Course creation is incomplete. Previously confirmed records will not be submitted again during this session."
          : "Unable to confirm course creation."
      );

      console.error(
        "[Course Creation]",
        err
      );
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  }

  // ====================================================
  // SCREEN
  // ====================================================

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBack}
            disabled={saving}
          >
            <Ionicons
              name="arrow-back"
              size={25}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>
              Create New Course
            </Text>

            <Text style={styles.muted}>
              DevMate Admin Portal
            </Text>
          </View>
        </View>

        {/* PROGRESS */}

        <View style={styles.progressContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.progressText}>
              Step {step + 1} of 4
            </Text>

            <Text style={styles.progressText}>
              {(step + 1) * 25}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    step === 0
                      ? "25%"
                      : step === 1
                      ? "50%"
                      : step === 2
                      ? "75%"
                      : "100%",
                },
              ]}
            />
          </View>

          <View style={styles.stepRow}>
            {STEPS.map((item, index) => (
              <View
                key={item}
                style={[
                  styles.stepItem,
                  step === index &&
                    styles.activeStep,
                  index < step &&
                    styles.completedStep,
                ]}
              >
                {index < step ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COLORS.green}
                  />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      step === index &&
                        styles.activeStepText,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}

                <Text
                  style={[
                    styles.stepText,
                    step === index &&
                      styles.activeStepText,
                  ]}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* STEP 1: COURSE INFORMATION */}

          {step === 0 && (
            <View style={styles.card}>
              <View
                style={styles.sectionHeading}
              >
                <View style={styles.sectionIcon}>
                  <Ionicons
                    name="book-outline"
                    size={26}
                    color={COLORS.lightPurple}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>
                    Course Information
                  </Text>

                  <Text style={styles.muted}>
                    Define your learning programme
                  </Text>
                </View>
              </View>

              <Field
                label="Course ID"
                value={course.courseID}
                placeholder="e.g. JV-102"
                onChangeText={(value) =>
                  updateCourse(
                    "courseID",
                    value.toUpperCase()
                  )
                }
                editable={!saveStarted}
              />

              <Field
                label="Course Title"
                value={course.title}
                placeholder="Java Programming Fundamentals"
                onChangeText={(value) =>
                  updateCourse("title", value)
                }
                editable={!saveStarted}
              />

              <Text style={styles.label}>
                Programming Language
              </Text>

              <View style={styles.choiceRow}>
                {LANGUAGES.map((item) => (
                  <Choice
                    key={item}
                    label={item}
                    selected={
                      course.language === item
                    }
                    onPress={() =>
                      updateCourse(
                        "language",
                        item
                      )
                    }
                    disabled={saveStarted}
                  />
                ))}
              </View>

              <Field
                label="Module"
                value={course.module}
                placeholder="Introduction to Java"
                onChangeText={(value) =>
                  updateCourse("module", value)
                }
                editable={!saveStarted}
              />

              <Field
                label="Course Description"
                value={course.description}
                placeholder="Describe the objectives and learning outcomes."
                multiline
                onChangeText={(value) =>
                  updateCourse(
                    "description",
                    value
                  )
                }
                editable={!saveStarted}
              />

              <Field
                label="Due Date (Optional)"
                value={course.dueDate}
                placeholder="YYYY-MM-DD"
                onChangeText={(value) =>
                  updateCourse(
                    "dueDate",
                    value
                  )
                }
                editable={!saveStarted}
              />

              <Field
                label="Created By"
                value={course.createdBy}
                placeholder="Administrator identifier"
                onChangeText={(value) =>
                  updateCourse(
                    "createdBy",
                    value
                  )
                }
                editable={!saveStarted}
              />
            </View>
          )}

          {/* STEP 2: PRE-ASSESSMENT */}

          {step === 1 && (
            <AssessmentFormSection
              assessment={preAssessment}
              type="PRE_TEST"
              language={language}
              onChange={setPreAssessment}
              disabled={saveStarted}
            />
          )}

          {/* STEP 3: MINI-LESSONS */}

          {step === 2 && (
            <>
              <View style={styles.card}>
                <View
                  style={styles.sectionHeading}
                >
                  <View style={styles.sectionIcon}>
                    <Ionicons
                      name="library-outline"
                      size={26}
                      color={COLORS.lightPurple}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>
                      Mini-Lessons
                    </Text>

                    <Text style={styles.muted}>
                      Learning content and resources
                    </Text>
                  </View>
                </View>

                <Text style={styles.helper}>
                  Create lessons that students
                  complete after the pre-assessment
                  and before the post-assessment.
                </Text>
              </View>

              {lessons.length === 0 && (
                <View style={styles.emptyCard}>
                  <Ionicons
                    name="book-outline"
                    size={42}
                    color={COLORS.lightPurple}
                  />

                  <Text style={styles.cardTitle}>
                    No lessons added
                  </Text>

                  <Text style={styles.helper}>
                    Add your first mini-lesson.
                  </Text>
                </View>
              )}

              {lessons.map((lesson, index) => (
                <View
                  key={lesson.id}
                  style={styles.card}
                >
                  <View style={styles.listHeader}>
                    <Text style={styles.cardTitle}>
                      Lesson {index + 1}
                    </Text>

                    <TouchableOpacity
                      disabled={saveStarted}
                      onPress={() =>
                        setLessons((previous) =>
                          previous.filter(
                            (item) =>
                              item.id !==
                              lesson.id
                          )
                        )
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color={COLORS.red}
                      />
                    </TouchableOpacity>
                  </View>

                  <Field
                    label="Lesson Title"
                    value={lesson.title}
                    placeholder="Variables and Data Types"
                    onChangeText={(title) =>
                      updateLesson(
                        lesson.id,
                        { title }
                      )
                    }
                    editable={!saveStarted}
                  />

                  <Text style={styles.label}>
                    Lesson Type
                  </Text>

                  <View style={styles.choiceRow}>
                    {(
                      [
                        {
                          label: "Reading",
                          value: "READING",
                        },
                        {
                          label: "Video",
                          value: "VIDEO",
                        },
                        {
                          label: "Code Lab",
                          value: "CODE_LAB",
                        },
                      ] as const
                    ).map((item) => (
                      <Choice
                        key={item.value}
                        label={item.label}
                        selected={
                          lesson.contentType ===
                          item.value
                        }
                        onPress={() =>
                          updateLesson(
                            lesson.id,
                            {
                              contentType:
                                item.value,
                            }
                          )
                        }
                        disabled={saveStarted}
                      />
                    ))}
                  </View>

                  <Field
                    label="Lesson Explanation"
                    value={lesson.explanation}
                    placeholder="Explain concepts, provide examples and include practical exercises."
                    multiline
                    onChangeText={(
                      explanation
                    ) =>
                      updateLesson(
                        lesson.id,
                        { explanation }
                      )
                    }
                    editable={!saveStarted}
                  />

                  <Field
                    label="Resource Links (Optional)"
                    value={lesson.resources}
                    placeholder="https://example.com/tutorial"
                    multiline
                    onChangeText={(resources) =>
                      updateLesson(
                        lesson.id,
                        { resources }
                      )
                    }
                    editable={!saveStarted}
                  />

                  <Text style={styles.helper}>
                    Add one resource URL per line.
                    Explanations and resources are
                    saved with the lesson.
                  </Text>
                </View>
              ))}

              <Action
                label="Add Mini-Lesson"
                icon="add-circle-outline"
                outline
                disabled={saveStarted}
                onPress={() =>
                  setLessons((previous) => [
                    ...previous,
                    newLesson(),
                  ])
                }
              />
            </>
          )}

          {/* STEP 4: POST-ASSESSMENT */}

          {step === 3 && (
            <>
              <AssessmentFormSection
                assessment={postAssessment}
                type="POST_TEST"
                language={language}
                onChange={setPostAssessment}
                disabled={saveStarted}
              />

              {/* COURSE SUMMARY */}

              <View style={styles.summaryCard}>
                <Text style={styles.sectionTitle}>
                  Course Summary
                </Text>

                <Text style={styles.summaryTitle}>
                  {course.title}
                </Text>

                <Text style={styles.muted}>
                  {course.courseID}
                  {" · "}
                  {course.language}
                </Text>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Pre-test Questions
                  </Text>
                  <Text style={styles.summaryValue}>
                    {preAssessment.questions.length}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Pre-test AI
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color:
                          preAssessment.aiAllowed
                            ? COLORS.green
                            : COLORS.grey,
                      },
                    ]}
                  >
                    {preAssessment.aiAllowed
                      ? "Enabled"
                      : "Disabled"}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Mini-Lessons
                  </Text>
                  <Text style={styles.summaryValue}>
                    {lessons.length}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Post-test Questions
                  </Text>
                  <Text style={styles.summaryValue}>
                    {postAssessment.questions.length}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Post-test AI
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color:
                          postAssessment.aiAllowed
                            ? COLORS.green
                            : COLORS.grey,
                      },
                    ]}
                  >
                    {postAssessment.aiAllowed
                      ? "Enabled"
                      : "Disabled"}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* ERROR AND SAVE STATUS */}

          {!!error && (
            <View style={styles.errorCard}>
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={COLORS.red}
              />

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

          {!!saveMessage && (
            <View style={styles.notice}>
              {saving && (
                <ActivityIndicator
                  color={COLORS.lightPurple}
                />
              )}

              <Text style={styles.noticeText}>
                {saveMessage}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* BOTTOM NAVIGATION */}

        <View style={styles.footer}>
          {step > 0 && !saveStarted && (
            <TouchableOpacity
              style={styles.previousButton}
              onPress={goBack}
              disabled={saving}
            >
              <Ionicons
                name="arrow-back"
                size={19}
                color={COLORS.white}
              />

              <Text style={styles.buttonText}>
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              saving && styles.disabled,
            ]}
            disabled={saving}
            onPress={
              step === 3
                ? saveCompleteCourse
                : continueForm
            }
          >
            {saving ? (
              <>
                <ActivityIndicator
                  color={COLORS.white}
                />
                <Text style={styles.buttonText}>
                  Saving Course...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {step === 3
                    ? saveStarted
                      ? "Retry Save"
                      : "Save Complete Course"
                    : "Continue"}
                </Text>

                <Ionicons
                  name={
                    step === 3
                      ? "save-outline"
                      : "arrow-forward"
                  }
                  size={20}
                  color={COLORS.white}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 11,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: 4,
  },

  muted: {
    color: COLORS.grey,
    fontSize: 12,
    lineHeight: 18,
  },

  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  progressText: {
    color: COLORS.lightPurple,
    fontSize: 12,
    fontWeight: "600",
  },

  progressTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },

  progressFill: {
    height: 6,
    backgroundColor: COLORS.purple,
    borderRadius: 10,
  },

  stepRow: {
    flexDirection: "row",
    gap: 7,
  },

  stepItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 3,
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
  },

  activeStep: {
    backgroundColor: "#32224B",
    borderColor: COLORS.purple,
  },

  completedStep: {
    borderColor: "#284C35",
  },

  stepNumber: {
    color: COLORS.grey,
    fontSize: 16,
    fontWeight: "bold",
  },

  stepText: {
    color: COLORS.grey,
    fontSize: 11,
    fontWeight: "600",
  },

  activeStepText: {
    color: COLORS.lightPurple,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#292929",
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },

  sectionIcon: {
    width: 49,
    height: 49,
    borderRadius: 12,
    backgroundColor: "#302143",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 5,
  },

  cardTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
  },

  field: {
    marginBottom: 17,
  },

  label: {
    color: "#DDDDDD",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 9,
  },

  input: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.white,
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    minHeight: 49,
  },

  multiline: {
    minHeight: 110,
  },

  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 19,
  },

  choice: {
    backgroundColor: COLORS.input,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 9,
  },

  selectedChoice: {
    backgroundColor: "#372452",
    borderColor: COLORS.purple,
  },

  choiceText: {
    color: COLORS.grey,
    fontSize: 13,
    fontWeight: "600",
  },

  selectedChoiceText: {
    color: "#DDD6FE",
  },

  helper: {
    color: COLORS.grey,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 16,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  counter: {
    color: COLORS.lightPurple,
    backgroundColor: "#302143",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: "bold",
  },

  aiCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#241A35",
    borderWidth: 1,
    borderColor: "#453062",
    borderRadius: 11,
    padding: 12,
    gap: 10,
  },

  aiIcon: {
    alignItems: "center",
    justifyContent: "center",
  },

  aiTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },

  aiDescription: {
    color: "#C4B5FD",
    fontSize: 11,
    lineHeight: 17,
  },

  typeBadge: {
    backgroundColor: "#36244F",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 8,
    marginBottom: 19,
  },

  typeText: {
    color: "#C4B5FD",
    fontWeight: "600",
    fontSize: 12,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 9,
    marginBottom: 10,
  },

  correctOption: {
    borderColor: "#36854E",
    backgroundColor: "#192B20",
  },

  optionLetter: {
    color: COLORS.grey,
    fontSize: 14,
    fontWeight: "bold",
  },

  optionInput: {
    flex: 1,
    minHeight: 49,
    color: COLORS.white,
    fontSize: 14,
  },

  correctNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 5,
  },

  correctText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: "600",
  },

  testCaseCard: {
    backgroundColor: "#222222",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    borderRadius: 12,
    marginBottom: 12,
  },

  button: {
    flexDirection: "row",
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    minHeight: 48,
    padding: 13,
    gap: 9,
    marginBottom: 12,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },

  outlineButton: {
    borderColor: COLORS.purple,
    borderWidth: 1,
    backgroundColor: "#241A35",
  },

  outlineText: {
    color: COLORS.lightPurple,
  },

  disabled: {
    opacity: 0.5,
  },

  emptyCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    gap: 13,
    marginBottom: 16,
  },

  summaryCard: {
    backgroundColor: "#211832",
    borderColor: "#453062",
    borderWidth: 1,
    padding: 17,
    borderRadius: 14,
    marginTop: 7,
    marginBottom: 16,
  },

  summaryTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 5,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 13,
  },

  summaryLabel: {
    color: "#CCCCCC",
    fontSize: 13,
  },

  summaryValue: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 13,
  },

  divider: {
    height: 1,
    backgroundColor: "#453062",
    marginVertical: 17,
  },

  errorCard: {
    flexDirection: "row",
    backgroundColor: "#342020",
    borderWidth: 1,
    borderColor: "#713737",
    borderRadius: 11,
    padding: 14,
    gap: 10,
    marginBottom: 15,
  },

  errorText: {
    flex: 1,
    color: COLORS.red,
    fontSize: 13,
    lineHeight: 20,
  },

  notice: {
    backgroundColor: "#241A35",
    borderRadius: 11,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  noticeText: {
    flex: 1,
    color: COLORS.lightPurple,
    fontSize: 13,
    lineHeight: 19,
  },

  footer: {
    flexDirection: "row",
    backgroundColor: "#151515",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 15,
    gap: 11,
  },

  previousButton: {
    backgroundColor: "#333333",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },

  nextButton: {
    flex: 1,
    backgroundColor: COLORS.purple,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 11,
    gap: 9,
  },
});
