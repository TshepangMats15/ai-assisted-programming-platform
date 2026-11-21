
package com.devmate.Services;

import com.devmate.Entities.Assessment;
import com.devmate.Entities.Coursework;
import com.devmate.Entities.Question;
import com.devmate.Entities.QuestionTestCase;

import com.devmate.Repository.AssessmentRepository;
import com.devmate.Repository.CourseworkRepository;
import com.devmate.Repository.QuestionRepository;
import com.devmate.Repository.QuestionTestCaseRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AssessmentServices {

    private final AssessmentRepository assessmentRepository;
    private final QuestionRepository questionRepository;
    private final QuestionTestCaseRepository testCaseRepository;
    private final CourseworkRepository courseworkRepository;
    private final EntityManager entityManager;

    public AssessmentServices(
            AssessmentRepository assessmentRepository,
            QuestionRepository questionRepository,
            QuestionTestCaseRepository testCaseRepository,
            CourseworkRepository courseworkRepository,
            EntityManager entityManager) {

        this.assessmentRepository = assessmentRepository;
        this.questionRepository = questionRepository;
        this.testCaseRepository = testCaseRepository;
        this.courseworkRepository = courseworkRepository;
        this.entityManager = entityManager;
    }

    // =====================================================
    // COMPLETE ASSESSMENT REQUEST MODELS
    // =====================================================

    public record TestCaseRequest(
            String inputData,
            String expectedOutput
    ) {}

    public record QuestionRequest(
            String questionType,
            String prompt,
            List<String> options,
            String correctAnswer,
            String starterCode,
            List<TestCaseRequest> testCases
    ) {}

    public record AssessmentRequest(
            String courseID,
            String title,
            String description,
            String difficulty,
            String programLang,
            Integer timeLimit,
            String assessmentType,
            Boolean aiAllowed,
            List<QuestionRequest> questions
    ) {}

    // =====================================================
    // CREATE INDIVIDUAL ASSESSMENT
    // =====================================================

    public Assessment createAssessment(
            Assessment assessment) {

        return assessmentRepository.save(assessment);
    }

    // =====================================================
    // CREATE COMPLETE ASSESSMENT
    // =====================================================

    @Transactional
    public Assessment createCompleteAssessment(
            AssessmentRequest request) {

        if (request == null) {
            throw badRequest("Assessment data is required.");
        }

        String courseID = required(
                request.courseID(), "Course ID");

        String title = required(
                request.title(), "Assessment title");

        String description = required(
                request.description(), "Description");

        String difficulty = required(
                request.difficulty(), "Difficulty");

        String programLang = required(
                request.programLang(), "Programming language");

        String assessmentType = required(
                request.assessmentType(),
                "Assessment type"
        ).toUpperCase(Locale.ROOT);

        if (!assessmentType.equals("PRE_TEST")
                && !assessmentType.equals("POST_TEST")) {

            throw badRequest(
                    "Assessment type must be PRE_TEST or POST_TEST."
            );
        }

        if (request.timeLimit() == null
                || request.timeLimit() <= 0) {

            throw badRequest(
                    "Time limit must be greater than zero."
            );
        }

        if (request.questions() == null
                || request.questions().isEmpty()) {

            throw badRequest(
                    "At least one question is required."
            );
        }

        // Validate questions before saving.

        int codingQuestionCount = 0;

        for (QuestionRequest question : request.questions()) {

            validateQuestion(question);

            if ("CODING_CHALLENGE".equalsIgnoreCase(
                    question.questionType().trim())) {

                codingQuestionCount++;
            }
        }

        if (codingQuestionCount > 1) {
            throw badRequest(
                    "Only one coding challenge is supported per assessment."
            );
        }

        // Lock course to prevent duplicate assessments.

        Coursework course = entityManager.find(
                Coursework.class,
                courseID,
                LockModeType.PESSIMISTIC_WRITE
        );

        if (course == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Course not found: " + courseID
            );
        }

        boolean isPreAssessment =
                assessmentType.equals("PRE_TEST");

        if (isPreAssessment
                && course.getPreAssessment() != null) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This course already has a pre-assessment."
            );
        }

        if (!isPreAssessment
                && course.getPostAssessment() != null) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This course already has a post-assessment."
            );
        }

        // Create assessment.

        Assessment assessment = new Assessment();

        assessment.setTitle(title);
        assessment.setDescription(description);
        assessment.setDifficulty(difficulty);
        assessment.setProgramLang(programLang);
        assessment.setTimeLimit(request.timeLimit());
        assessment.setAssessmentType(assessmentType);
        assessment.setAiAllowed(
                Boolean.TRUE.equals(request.aiAllowed())
        );

        Assessment savedAssessment =
                assessmentRepository.saveAndFlush(
                        assessment
                );

        // Create questions and test cases.

        int questionNumber = 1;

        for (QuestionRequest questionRequest
                : request.questions()) {

            String questionType =
                    questionRequest.questionType()
                            .trim()
                            .toUpperCase(Locale.ROOT);

            String questionID =
                    "ASM-"
                    + savedAssessment.getAssessmentID()
                    + "-Q"
                    + questionNumber
                    + "-"
                    + UUID.randomUUID().toString();

            Question question = new Question();

            question.setQuestionID(questionID);
            question.setAssessment(savedAssessment);
            question.setQuestionType(questionType);
            question.setPrompt(
                    questionRequest.prompt().trim()
            );

            if ("MULTIPLE_CHOICE".equals(questionType)) {

                List<String> options =
                        questionRequest.options()
                                .stream()
                                .map(String::trim)
                                .toList();

                question.setOptionsJson(
                        toJsonArray(options)
                );

                question.setCorrectAnswer(
                        questionRequest.correctAnswer().trim()
                );

                question.setStarterCode(null);

            } else {

                question.setOptionsJson(null);
                question.setCorrectAnswer(null);

                question.setStarterCode(
                        questionRequest.starterCode()
                );
            }

            Question savedQuestion =
                    questionRepository.saveAndFlush(
                            question
                    );

            // Save coding challenge test cases.

            if ("CODING_CHALLENGE".equals(questionType)) {

                for (TestCaseRequest testCase
                        : questionRequest.testCases()) {

                    QuestionTestCase entity =
                            new QuestionTestCase();

                    entity.setQuestion(savedQuestion);

                    entity.setInputData(
                            testCase.inputData() == null
                                    ? ""
                                    : testCase.inputData()
                    );

                    entity.setExpectedOutput(
                            testCase.expectedOutput()
                    );

                    testCaseRepository.save(entity);
                }
            }

            questionNumber++;
        }

        // Connect assessment to course.

        if (isPreAssessment) {
            course.setPreAssessment(savedAssessment);
        } else {
            course.setPostAssessment(savedAssessment);
        }

        courseworkRepository.saveAndFlush(course);

        return savedAssessment;
    }

    // =====================================================
    // QUESTION VALIDATION
    // =====================================================

    private void validateQuestion(
            QuestionRequest question) {

        if (question == null) {
            throw badRequest(
                    "Question data is required."
            );
        }

        required(question.prompt(), "Question prompt");

        String type = required(
                question.questionType(),
                "Question type"
        ).toUpperCase(Locale.ROOT);

        if ("MULTIPLE_CHOICE".equals(type)) {

            if (question.options() == null
                    || question.options().size() < 2) {

                throw badRequest(
                        "Multiple-choice questions require at least two options."
                );
            }

            Set<String> uniqueOptions = new HashSet<>();

            for (String option : question.options()) {

                String cleanOption = required(
                        option, "Answer option"
                );

                if (!uniqueOptions.add(
                        cleanOption.toLowerCase(Locale.ROOT))) {

                    throw badRequest(
                            "Answer options must be different."
                    );
                }
            }

            String correctAnswer = required(
                    question.correctAnswer(),
                    "Correct answer"
            );

            boolean answerExists =
                    question.options()
                            .stream()
                            .map(String::trim)
                            .anyMatch(correctAnswer::equals);

            if (!answerExists) {

                throw badRequest(
                        "The correct answer must match an answer option."
                );
            }

        } else if ("CODING_CHALLENGE".equals(type)) {

            if (question.testCases() == null
                    || question.testCases().isEmpty()) {

                throw badRequest(
                        "Coding challenges require at least one test case."
                );
            }

            for (TestCaseRequest testCase
                    : question.testCases()) {

                if (testCase == null
                        || testCase.expectedOutput() == null) {

                    throw badRequest(
                            "Every test case requires an expected output."
                    );
                }

                if (testCase.inputData() != null
                        && testCase.inputData().length() > 10000) {

                    throw badRequest(
                            "Test case input exceeds the execution limit."
                    );
                }
            }

        } else {

            throw badRequest(
                    "Unsupported question type: " + type
            );
        }
    }

    // =====================================================
    // VALIDATION HELPERS
    // =====================================================

    private String required(
            String value,
            String fieldName) {

        if (value == null || value.isBlank()) {

            throw badRequest(
                    fieldName + " is required."
            );
        }

        return value.trim();
    }

    private ResponseStatusException badRequest(
            String message) {

        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                message
        );
    }

    // =====================================================
    // CONVERT MCQ OPTIONS TO JSON ARRAY
    // =====================================================

    private String toJsonArray(List<String> options) {

        return options.stream()
                .map(this::quoteJson)
                .collect(
                        Collectors.joining(",", "[", "]")
                );
    }

    private String quoteJson(String value) {

        StringBuilder builder = new StringBuilder("\"");

        for (int i = 0; i < value.length(); i++) {

            char character = value.charAt(i);

            switch (character) {

                case '"' -> builder.append("\\\"");
                case '\\' -> builder.append("\\\\");
                case '\n' -> builder.append("\\n");
                case '\r' -> builder.append("\\r");
                case '\t' -> builder.append("\\t");
                case '\b' -> builder.append("\\b");
                case '\f' -> builder.append("\\f");

                default -> {

                    if (character < 32) {

                        builder.append(
                                String.format(
                                        "\\u%04x",
                                        (int) character
                                )
                        );

                    } else {

                        builder.append(character);
                    }
                }
            }
        }

        return builder.append('"').toString();
    }

    // =====================================================
    // READ ALL
    // =====================================================

    public List<Assessment> getAllAssessments() {

        return assessmentRepository.findAll();
    }

    // =====================================================
    // READ ONE
    // =====================================================

    public Assessment getAssessmentById(
            Integer assessmentID) {

        return assessmentRepository
                .findById(assessmentID)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Assessment not found with ID: "
                                        + assessmentID
                        )
                );
    }

    // =====================================================
    // READ QUESTIONS
    // =====================================================

    public List<Question> getQuestionsByAssessmentId(
            Integer assessmentID) {

        getAssessmentById(assessmentID);

        return questionRepository
                .findByAssessmentAssessmentID(
                        assessmentID
                );
    }

    // =====================================================
    // UPDATE
    // =====================================================

    public Assessment updateAssessment(
            Integer assessmentID,
            Assessment updatedAssessment) {

        Assessment existingAssessment =
                getAssessmentById(assessmentID);

        existingAssessment.setTitle(
                updatedAssessment.getTitle()
        );

        existingAssessment.setDescription(
                updatedAssessment.getDescription()
        );

        existingAssessment.setDifficulty(
                updatedAssessment.getDifficulty()
        );

        existingAssessment.setProgramLang(
                updatedAssessment.getProgramLang()
        );

        existingAssessment.setTimeLimit(
                updatedAssessment.getTimeLimit()
        );

        existingAssessment.setAssessmentType(
                updatedAssessment.getAssessmentType()
        );

        existingAssessment.setAiAllowed(
                updatedAssessment.getAiAllowed()
        );

        return assessmentRepository.save(
                existingAssessment
        );
    }

    // =====================================================
    // DELETE
    // =====================================================

    public void deleteAssessment(Integer assessmentID) {

        if (!assessmentRepository.existsById(
                assessmentID)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Assessment not found with ID: "
                            + assessmentID
            );
        }

        assessmentRepository.deleteById(
                assessmentID
        );
    }
}
