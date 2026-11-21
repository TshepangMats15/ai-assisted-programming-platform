
package AI.Productivity.Platform.service;

import AI.Productivity.Platform.entity.Submission;
import AI.Productivity.Platform.entity.SubmissionAnswer;
import AI.Productivity.Platform.entity.SubmissionStatus;

import AI.Productivity.Platform.repository.SubmissionRepository;
import AI.Productivity.Platform.repository.SubmissionAnswerRepository;

import com.devmate.Entities.Question;
import com.devmate.Entities.QuestionTestCase;

import com.devmate.Repository.QuestionRepository;
import com.devmate.Repository.QuestionTestCaseRepository;
import com.devmate.Repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.Locale;

@Service
public class SubmissionFinalizationService {

    private static final Set<String> SUPPORTED_LANGUAGES =
            Set.of(
                    "java",
                    "python",
                    "cpp",
                    "c++",
                    "c",
                    "javascript",
                    "typescript",
                    "csharp",
                    "ruby",
                    "sql"
            );

    private final SubmissionRepository submissionRepository;
    private final SubmissionAnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final QuestionTestCaseRepository testCaseRepository;
    private final UserRepository userRepository;

    public SubmissionFinalizationService(
            SubmissionRepository submissionRepository,
            SubmissionAnswerRepository answerRepository,
            QuestionRepository questionRepository,
            QuestionTestCaseRepository testCaseRepository,
            UserRepository userRepository
    ) {
        this.submissionRepository = submissionRepository;
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.testCaseRepository = testCaseRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Submission finalizeSubmission(
            Long submissionId,
            String firebaseUid
    ) {
        requireStudent(firebaseUid);

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
                        submission.getUser()
                                .getFirebaseUid()
                )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not own this submission."
            );
        }

        // HANDLE REPEATED FINAL SUBMISSION REQUESTS
        if (submission.getStatus() ==
                SubmissionStatus.SUBMITTED ||

                submission.getStatus() ==
                SubmissionStatus.GRADING ||

                submission.getStatus() ==
                SubmissionStatus.GRADED) {

            return submission;
        }

        if (submission.getStatus() !=
                SubmissionStatus.DRAFT) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invalid submission status."
            );
        }

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
                    HttpStatus.BAD_REQUEST,
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

        int codingQuestionCount = 0;
        int mcqQuestionCount = 0;

        for (Question question : questions) {

            if ("MULTIPLE_CHOICE".equalsIgnoreCase(
                    question.getQuestionType()
            )) {

                mcqQuestionCount++;

                String selectedAnswer =
                        savedAnswers.get(
                                question.getQuestionID()
                        );

                if (selectedAnswer == null ||
                        selectedAnswer.isBlank()) {

                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Complete all multiple-choice questions."
                    );
                }

                if (question.getCorrectAnswer() == null ||
                        question.getCorrectAnswer().isBlank()) {

                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Assessment marking configuration is incomplete."
                    );
                }

            } else if (
                    "CODING_CHALLENGE".equalsIgnoreCase(
                            question.getQuestionType()
                    )
            ) {

                codingQuestionCount++;

                validateCodingQuestion(
                        submission,
                        question
                );

            } else {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Unsupported assessment question type."
                );
            }
        }

        // CURRENT SUBMISSION MODEL STORES ONE SOURCE FILE
        if (codingQuestionCount > 1) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Multiple coding questions are not supported."
            );
        }

        if (codingQuestionCount == 0 &&
                mcqQuestionCount == 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Assessment contains no gradable questions."
            );
        }

        LocalDateTime now = LocalDateTime.now();

        submission.setStatus(
                SubmissionStatus.SUBMITTED
        );

        submission.setSubmittedAt(now);
        submission.setSubmissionTime(now);
        submission.setScore(null);
        submission.setGradedAt(null);

        return submissionRepository.save(submission);
    }

    private void validateCodingQuestion(
            Submission submission,
            Question question
    ) {
        if (submission.getSourceCode() == null ||
                submission.getSourceCode().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Save your code before submitting."
            );
        }

        String language = submission
                .getAssessment()
                .getProgramLang();

        if (language == null ||
                !SUPPORTED_LANGUAGES.contains(
                        language.trim()
                                .toLowerCase(Locale.ROOT)
                )) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported programming language."
            );
        }

        List<QuestionTestCase> testCases =
                testCaseRepository
                        .findByQuestionQuestionID(
                                question.getQuestionID()
                        );

        if (testCases.isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Coding assessment has no test cases."
            );
        }

        for (QuestionTestCase testCase : testCases) {

            if (testCase.getExpectedOutput() == null) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Assessment test case configuration is incomplete."
                );
            }

            if (testCase.getInputData() != null &&
                    testCase.getInputData().length() > 10_000) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Assessment test input exceeds execution limits."
                );
            }
        }
    }

    private void requireStudent(String firebaseUid) {

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
    }
}
