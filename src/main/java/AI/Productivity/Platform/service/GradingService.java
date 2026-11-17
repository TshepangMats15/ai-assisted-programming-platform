
package AI.Productivity.Platform.service;

import AI.Productivity.Platform.dto.GradeSubmissionRequest;
import AI.Productivity.Platform.dto.ResultResponse;
import AI.Productivity.Platform.entity.Result;
import AI.Productivity.Platform.entity.Submission;
import AI.Productivity.Platform.repository.ResultRepository;
import AI.Productivity.Platform.repository.SubmissionRepository;

import com.devmate.Entities.Assessment;
import com.devmate.Entities.Question;
import com.devmate.Entities.QuestionTestCase;
import com.devmate.Repository.QuestionRepository;
import com.devmate.Repository.QuestionTestCaseRepository;
import com.devmate.Services.CoderunServices;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class GradingService {

    private static final BigDecimal CODING_WEIGHT =
            new BigDecimal("0.50");

    private static final BigDecimal MCQ_WEIGHT =
            new BigDecimal("0.50");

    private final SubmissionRepository submissionRepository;
    private final ResultRepository resultRepository;
    private final QuestionRepository questionRepository;
    private final QuestionTestCaseRepository testCaseRepository;
    private final CoderunServices coderunServices;

    public GradingService(
            SubmissionRepository submissionRepository,
            ResultRepository resultRepository,
            QuestionRepository questionRepository,
            QuestionTestCaseRepository testCaseRepository,
            CoderunServices coderunServices
    ) {
        this.submissionRepository = submissionRepository;
        this.resultRepository = resultRepository;
        this.questionRepository = questionRepository;
        this.testCaseRepository = testCaseRepository;
        this.coderunServices = coderunServices;
    }

    // GRADE A SAVED STUDENT SUBMISSION
    public ResultResponse gradeSubmission(
            Long submissionId,
            String firebaseUid,
            GradeSubmissionRequest request
    ) {

        // 1. REQUIRE AUTHENTICATION
        if (firebaseUid == null || firebaseUid.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required."
            );
        }

        if (submissionId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Submission ID is required."
            );
        }

        // 2. LOAD THE SAVED SUBMISSION
        Submission submission = submissionRepository
                .findById(submissionId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Submission not found."
                        )
                );

        // 3. VERIFY SUBMISSION OWNERSHIP
        if (submission.getUser() == null
                || !firebaseUid.equals(
                        submission.getUser().getFirebaseUid()
                )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot grade another student's submission."
            );
        }

        if (submission.getSourceCode() == null
                || submission.getSourceCode().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Submission contains no source code."
            );
        }

        // 4. LOAD ASSESSMENT
        Assessment assessment = submission.getAssessment();

        if (assessment == null
                || assessment.getAssessmentID() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Submission has no valid assessment."
            );
        }

        Integer assessmentId = assessment.getAssessmentID();

        String language = assessment.getProgramLang();

        if (language == null || language.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Assessment programming language is missing."
            );
        }

        // 5. LOAD ASSESSMENT QUESTIONS
        List<Question> questions =
                questionRepository.findByAssessmentAssessmentID(
                        assessmentId
                );

        if (questions == null || questions.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Assessment has no questions."
            );
        }

        Question codingQuestion = null;
        int codingQuestionCount = 0;

        for (Question question : questions) {
            if ("CODING_CHALLENGE".equalsIgnoreCase(
                    question.getQuestionType()
            )) {
                codingQuestion = question;
                codingQuestionCount++;
            }
        }

        if (codingQuestionCount != 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Assessment must contain exactly one coding question."
            );
        }

        // 6. LOAD CODING TEST CASES
        List<QuestionTestCase> testCases =
                testCaseRepository.findByQuestionQuestionID(
                        codingQuestion.getQuestionID()
                );

        if (testCases == null || testCases.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Coding question has no test cases."
            );
        }

        for (QuestionTestCase testCase : testCases) {
            if (testCase.getExpectedOutput() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "A coding test case has no expected output."
                );
            }
        }

        // 7. VALIDATE MULTIPLE-CHOICE QUESTIONS
        int totalMcq = 0;
        Set<String> mcqQuestionIds = new HashSet<>();

        for (Question question : questions) {
            if ("MULTIPLE_CHOICE".equalsIgnoreCase(
                    question.getQuestionType()
            )) {
                totalMcq++;

                mcqQuestionIds.add(
                        question.getQuestionID()
                );

                if (question.getCorrectAnswer() == null
                        || question.getCorrectAnswer().isBlank()) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "An MCQ question has no correct answer."
                    );
                }
            }
        }

        // Both components are required for fixed 50/50 weighting.
        if (totalMcq == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Assessment must contain multiple-choice questions."
            );
        }

        Map<String, String> mcqAnswers =
                request == null || request.mcqAnswers() == null
                        ? Map.of()
                        : request.mcqAnswers();

        // Reject answers for questions outside this assessment.
        for (String questionId : mcqAnswers.keySet()) {
            if (!mcqQuestionIds.contains(questionId)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid multiple-choice question ID."
                );
            }
        }

        // 8. GRADE CODING TEST CASES
        int passedTests = 0;

        for (QuestionTestCase testCase : testCases) {

            String input = testCase.getInputData() == null
                    ? ""
                    : testCase.getInputData();

            Map<String, Object> execution;

            try {
                execution = coderunServices.run(
                        language,
                        submission.getSourceCode(),
                        input
                );
            } catch (Exception exception) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Code execution service failed. "
                                + "Please retry grading.",
                        exception
                );
            }

            if (execution == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Code execution service returned no result."
                );
            }

            Object statusId = execution.get("statusId");

            if (!(statusId instanceof Number)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Judge0 returned an incomplete execution result."
                );
            }

            int judgeStatus = ((Number) statusId).intValue();

            // Judge0 status 3 means execution completed successfully.
            if (judgeStatus == 3) {

                String actualOutput = String.valueOf(
                        execution.getOrDefault("stdout", "")
                );

                String expectedOutput =
                        testCase.getExpectedOutput();

                if (normalizeOutput(actualOutput).equals(
                        normalizeOutput(expectedOutput)
                )) {
                    passedTests++;
                }
            }
        }

        BigDecimal codingScore = percentage(
                passedTests,
                testCases.size()
        );

        // 9. GRADE MULTIPLE-CHOICE ANSWERS
        int correctMcq = 0;

        for (Question question : questions) {

            if (!"MULTIPLE_CHOICE".equalsIgnoreCase(
                    question.getQuestionType()
            )) {
                continue;
            }

            String studentAnswer = mcqAnswers.get(
                    question.getQuestionID()
            );

            String correctAnswer = question.getCorrectAnswer();

            if (studentAnswer != null
                    && studentAnswer.trim().equalsIgnoreCase(
                            correctAnswer.trim()
                    )) {
                correctMcq++;
            }
        }

        BigDecimal mcqScore = percentage(
                correctMcq,
                totalMcq
        );

        // 10. FINAL SCORE: 50% CODING + 50% MCQ
        BigDecimal finalScore = codingScore
                .multiply(CODING_WEIGHT)
                .add(mcqScore.multiply(MCQ_WEIGHT))
                .setScale(2, RoundingMode.HALF_UP);

        // 11. SAVE RESULT TO MYSQL
        LocalDateTime now = LocalDateTime.now();

        Result result = new Result(
                submission.getUser().getId(),
                assessmentId,
                finalScore,
                null,
                null,
                now
        );

        Result savedResult = resultRepository.save(result);

        // Also update the saved submission's score.
        submission.setScore(finalScore);
        submissionRepository.save(submission);

        // 12. RETURN RESULT RESPONSE
        return new ResultResponse(
                savedResult.getResultId(),
                "Assessment graded successfully. Score: "
                        + finalScore + "%",
                now
        );
    }

    // CALCULATE A PERCENTAGE FROM CORRECT / TOTAL
    private BigDecimal percentage(int correct, int total) {

        if (total <= 0) {
            throw new IllegalArgumentException(
                    "Total questions or tests must be greater than zero."
            );
        }

        return BigDecimal.valueOf(correct)
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        BigDecimal.valueOf(total),
                        4,
                        RoundingMode.HALF_UP
                );
    }

    // NORMALIZE LINE ENDINGS AND TRAILING WHITESPACE
    private String normalizeOutput(String output) {

        if (output == null) {
            return "";
        }

        return output
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .stripTrailing();
    }
}

