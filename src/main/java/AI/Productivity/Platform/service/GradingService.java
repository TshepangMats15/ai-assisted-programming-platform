
package AI.Productivity.Platform.service;

import AI.Productivity.Platform.dto.ResultResponse;

import AI.Productivity.Platform.entity.Result;
import AI.Productivity.Platform.entity.Submission;
import AI.Productivity.Platform.entity.SubmissionAnswer;
import AI.Productivity.Platform.entity.SubmissionStatus;

import AI.Productivity.Platform.repository.ResultRepository;
import AI.Productivity.Platform.repository.SubmissionRepository;
import AI.Productivity.Platform.repository.SubmissionAnswerRepository;

import com.devmate.Entities.Question;
import com.devmate.Entities.QuestionTestCase;

import com.devmate.Repository.QuestionRepository;
import com.devmate.Repository.QuestionTestCaseRepository;
import com.devmate.Repository.UserRepository;

import com.devmate.Services.CoderunServices;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GradingService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionAnswerRepository answerRepository;
    private final ResultRepository resultRepository;

    private final QuestionRepository questionRepository;
    private final QuestionTestCaseRepository testCaseRepository;
    private final UserRepository userRepository;

    private final CoderunServices coderunServices;
    private final TransactionTemplate transactionTemplate;

    public GradingService(
            SubmissionRepository submissionRepository,
            SubmissionAnswerRepository answerRepository,
            ResultRepository resultRepository,
            QuestionRepository questionRepository,
            QuestionTestCaseRepository testCaseRepository,
            UserRepository userRepository,
            CoderunServices coderunServices,
            PlatformTransactionManager transactionManager
    ) {
        this.submissionRepository = submissionRepository;
        this.answerRepository = answerRepository;
        this.resultRepository = resultRepository;
        this.questionRepository = questionRepository;
        this.testCaseRepository = testCaseRepository;
        this.userRepository = userRepository;
        this.coderunServices = coderunServices;

        this.transactionTemplate =
                new TransactionTemplate(transactionManager);
    }

    // IMMUTABLE TEST CASE DATA
    private record CodingTest(
            String input,
            String expectedOutput
    ) {
    }

    // GRADING DATA LOADED FROM MYSQL
    private record GradingData(
            String sourceCode,
            String language,
            List<CodingTest> tests,
            int correctMcq,
            int totalMcq,
            ResultResponse existingResult
    ) {
    }

    // MAIN GRADING METHOD
    public ResultResponse gradeSubmission(
            Long submissionId,
            String firebaseUid
    ) {
        // LOAD DATA INSIDE A SHORT TRANSACTION
        GradingData data = transactionTemplate.execute(
                transaction ->
                        prepareGrading(
                                submissionId,
                                firebaseUid
                        )
        );

        if (data == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to prepare grading."
            );
        }

        // RETURN EXISTING RESULT WITHOUT REGRADING
        if (data.existingResult() != null) {
            return data.existingResult();
        }

        // EXECUTE JUDGE0 OUTSIDE THE DATABASE TRANSACTION
        int passedTests = 0;

        for (CodingTest test : data.tests()) {

            if (executeTest(data, test)) {
                passedTests++;
            }
        }

        BigDecimal finalScore = calculateScore(
                passedTests,
                data.tests().size(),
                data.correctMcq(),
                data.totalMcq()
        );

        // SAVE RESULT AND SCORE ATOMICALLY
        return transactionTemplate.execute(
                transaction ->
                        persistResult(
                                submissionId,
                                firebaseUid,
                                finalScore
                        )
        );
    }

    // PREPARE ASSESSMENT GRADING DATA
    private GradingData prepareGrading(
            Long submissionId,
            String firebaseUid
    ) {
        Submission submission = requireOwnedSubmission(
                submissionId,
                firebaseUid
        );

        // CHECK FOR AN EXISTING RESULT
        Result existingResult = resultRepository
                .findBySubmissionId(submissionId)
                .orElse(null);

        if (existingResult != null) {

            if (submission.getStatus() !=
                    SubmissionStatus.GRADED) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Submission and result status are inconsistent."
                );
            }

            return new GradingData(
                    null,
                    null,
                    List.of(),
                    0,
                    0,
                    toResponse(existingResult)
            );
        }

        requireSubmitted(submission);

        Integer assessmentId = submission
                .getAssessment()
                .getAssessmentID();

        List<Question> questions =
                questionRepository
                        .findByAssessmentAssessmentID(
                                assessmentId
                        );

        if (questions.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Assessment contains no questions."
            );
        }

        Map<String, String> savedAnswers =
                new HashMap<>();

        for (SubmissionAnswer answer :
                answerRepository
                        .findBySubmissionSubmissionId(
                                submissionId
                        )) {

            savedAnswers.put(
                    answer.getQuestionId(),
                    answer.getSelectedAnswer()
            );
        }

        List<CodingTest> codingTests =
                new ArrayList<>();

        int correctMcq = 0;
        int totalMcq = 0;
        int codingQuestionCount = 0;

        for (Question question : questions) {

            if ("MULTIPLE_CHOICE".equalsIgnoreCase(
                    question.getQuestionType()
            )) {

                totalMcq++;

                String expected =
                        question.getCorrectAnswer();

                String selected = savedAnswers.get(
                        question.getQuestionID()
                );

                if (expected == null ||
                        expected.isBlank()) {

                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "MCQ marking configuration is incomplete."
                    );
                }

                if (selected == null ||
                        selected.isBlank()) {

                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "A required MCQ answer is missing."
                    );
                }

                if (selected.trim().equalsIgnoreCase(
                        expected.trim()
                )) {
                    correctMcq++;
                }

            } else if (
                    "CODING_CHALLENGE".equalsIgnoreCase(
                            question.getQuestionType()
                    )
            ) {

                codingQuestionCount++;

                if (codingQuestionCount > 1) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Only one coding challenge is supported."
                    );
                }

                List<QuestionTestCase> cases =
                        testCaseRepository
                                .findByQuestionQuestionID(
                                        question.getQuestionID()
                                );

                if (cases.isEmpty()) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Coding question has no test cases."
                    );
                }

                for (QuestionTestCase test : cases) {

                    if (test.getExpectedOutput() == null) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Test case configuration is incomplete."
                        );
                    }

                    codingTests.add(
                            new CodingTest(
                                    test.getInputData() == null
                                            ? ""
                                            : test.getInputData(),
                                    test.getExpectedOutput()
                            )
                    );
                }

            } else {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Unsupported question type."
                );
            }
        }

        if (!codingTests.isEmpty() &&
                (submission.getSourceCode() == null ||
                 submission.getSourceCode().isBlank())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Submission has no saved source code."
            );
        }

        return new GradingData(
                submission.getSourceCode(),
                submission.getAssessment().getProgramLang(),
                List.copyOf(codingTests),
                correctMcq,
                totalMcq,
                null
        );
    }

    // EXECUTE ONE CODING TEST
    private boolean executeTest(
            GradingData data,
            CodingTest test
    ) {
        Map<String, Object> execution;

        try {

            execution = coderunServices.run(
                    data.language(),
                    data.sourceCode(),
                    test.input()
            );

        } catch (Exception exception) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Code execution failed. Please retry grading.",
                    exception
            );
        }

        if (execution == null ||
                !(execution.get("statusId")
                        instanceof Number statusNumber)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Judge0 returned an incomplete result."
            );
        }

        int statusId = statusNumber.intValue();

        // SUCCESSFUL EXECUTION
        if (statusId == 3) {

            if (Boolean.TRUE.equals(
                    execution.get("stdoutTruncated")
            )) {
                return false;
            }

            Object output = execution.get("stdout");

            String actualOutput = output == null
                    ? ""
                    : String.valueOf(output);

            return normalizeOutput(actualOutput)
                    .equals(
                            normalizeOutput(
                                    test.expectedOutput()
                            )
                    );
        }

        // STUDENT CODE FAILURE
        // WRONG ANSWER, TIMEOUT, COMPILATION OR RUNTIME ERROR
        if (statusId >= 4 && statusId <= 12) {
            return false;
        }

        // INTERNAL ERROR, QUEUED OR UNKNOWN STATUS
        throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Judge0 could not complete grading. Please retry."
        );
    }

    // CALCULATE WEIGHTED FINAL SCORE
    private BigDecimal calculateScore(
            int passedTests,
            int totalTests,
            int correctMcq,
            int totalMcq
    ) {
        BigDecimal codingScore = percentage(
                passedTests,
                totalTests
        );

        BigDecimal mcqScore = percentage(
                correctMcq,
                totalMcq
        );

        BigDecimal finalScore;

        if (totalTests > 0 && totalMcq > 0) {

            finalScore = codingScore
                    .multiply(new BigDecimal("0.50"))
                    .add(
                            mcqScore.multiply(
                                    new BigDecimal("0.50")
                            )
                    );

        } else if (totalTests > 0) {

            finalScore = codingScore;

        } else if (totalMcq > 0) {

            finalScore = mcqScore;

        } else {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Assessment contains no gradable components."
            );
        }

        return finalScore.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }

    private BigDecimal percentage(
            int correct,
            int total
    ) {
        if (total == 0) {
            return BigDecimal.ZERO;
        }

        return BigDecimal.valueOf(correct)
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        BigDecimal.valueOf(total),
                        8,
                        RoundingMode.HALF_UP
                );
    }

    // SAVE RESULT AND UPDATE SUBMISSION TOGETHER
    private ResultResponse persistResult(
            Long submissionId,
            String firebaseUid,
            BigDecimal finalScore
    ) {
        Submission submission = requireOwnedSubmission(
                submissionId,
                firebaseUid
        );

        Result existingResult = resultRepository
                .findBySubmissionId(submissionId)
                .orElse(null);

        // PREVENT DUPLICATE RESULTS
        if (existingResult != null) {

            if (submission.getStatus() !=
                    SubmissionStatus.GRADED) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Submission and result status are inconsistent."
                );
            }

            return toResponse(existingResult);
        }

        requireSubmitted(submission);

        LocalDateTime now = LocalDateTime.now();

        Result result = new Result(
                submissionId,
                submission.getUser().getId(),
                submission.getAssessment().getAssessmentID(),
                finalScore,
                null,
                null,
                submission.getSubmittedAt()
        );

        Result savedResult =
                resultRepository.saveAndFlush(result);

        submission.setScore(finalScore);

        submission.setStatus(
                SubmissionStatus.GRADED
        );

        submission.setGradedAt(now);

        submissionRepository.saveAndFlush(
                submission
        );

        return toResponse(savedResult);
    }

    // VERIFY AUTHENTICATION, ROLE AND OWNERSHIP
    private Submission requireOwnedSubmission(
            Long submissionId,
            String firebaseUid
    ) {
        if (firebaseUid == null ||
                firebaseUid.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required."
            );
        }

        var user = userRepository
                .findByFirebaseUid(firebaseUid)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Student account not found."
                        )
                );

        if (!firebaseUid.equals(user.getFirebaseUid())
                || !"STUDENT".equals(user.getRole())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Student access required."
            );
        }

        Submission submission = submissionRepository
                .findByIdForUpdate(submissionId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Submission not found."
                        )
                );

        if (submission.getUser() == null ||
                !firebaseUid.equals(
                        submission.getUser().getFirebaseUid()
                )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not own this submission."
            );
        }

        return submission;
    }

    private void requireSubmitted(
            Submission submission
    ) {
        if (submission.getStatus() !=
                SubmissionStatus.SUBMITTED ||
                submission.getSubmittedAt() == null) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Assessment must be finalised before grading."
            );
        }
    }

    private ResultResponse toResponse(Result result) {

        return new ResultResponse(
                result.getResultId(),
                result.getSubmissionId(),
                result.getScore(),
                "GRADED",
                "Assessment graded successfully.",
                result.getSubmittedAt()
        );
    }

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
