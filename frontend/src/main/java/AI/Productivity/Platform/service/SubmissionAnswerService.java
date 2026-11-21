
package AI.Productivity.Platform.service;

import AI.Productivity.Platform.entity.Submission;
import AI.Productivity.Platform.entity.SubmissionAnswer;
import AI.Productivity.Platform.entity.SubmissionStatus;
import AI.Productivity.Platform.repository.SubmissionRepository;
import AI.Productivity.Platform.repository.SubmissionAnswerRepository;

import com.devmate.Entities.Question;
import com.devmate.Repository.QuestionRepository;
import com.devmate.Repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class SubmissionAnswerService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionAnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public SubmissionAnswerService(
            SubmissionRepository submissionRepository,
            SubmissionAnswerRepository answerRepository,
            QuestionRepository questionRepository,
            UserRepository userRepository
    ) {
        this.submissionRepository = submissionRepository;
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
    }

    // SAVE MULTIPLE-CHOICE ANSWERS
    @Transactional
    public Map<String, String> saveAnswers(
            Long submissionId,
            String firebaseUid,
            Map<String, String> answers
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

        requireOwner(submission, firebaseUid);

        if (submission.getStatus() !=
                SubmissionStatus.DRAFT) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This submission is locked."
            );
        }

        if (answers == null || answers.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No answers were provided."
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

        Map<String, Question> validQuestions =
                new HashMap<>();

        for (Question question : questions) {

            if ("MULTIPLE_CHOICE".equalsIgnoreCase(
                    question.getQuestionType()
            )) {
                validQuestions.put(
                        question.getQuestionID(),
                        question
                );
            }
        }

        // VALIDATE ALL ANSWERS BEFORE SAVING
        for (Map.Entry<String, String> entry :
                answers.entrySet()) {

            if (!validQuestions.containsKey(
                    entry.getKey()
            )) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid multiple-choice question."
                );
            }

            String selectedAnswer = entry.getValue();

            if (selectedAnswer == null ||
                    selectedAnswer.isBlank()) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selected answer cannot be empty."
                );
            }

            if (selectedAnswer.getBytes(
                    StandardCharsets.UTF_8
            ).length > 65_535) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selected answer is too long."
                );
            }
        }

        // CREATE OR UPDATE EACH ANSWER
        for (Map.Entry<String, String> entry :
                answers.entrySet()) {

            String questionId = entry.getKey();
            String selectedAnswer = entry.getValue();

            SubmissionAnswer answer =
                    answerRepository
                            .findBySubmissionSubmissionIdAndQuestionId(
                                    submissionId,
                                    questionId
                            )
                            .orElseGet(() ->
                                    new SubmissionAnswer(
                                            submission,
                                            questionId,
                                            selectedAnswer
                                    )
                            );

            answer.setSelectedAnswer(selectedAnswer);

            answerRepository.save(answer);
        }

        submission.setSavedAt(LocalDateTime.now());

        submissionRepository.save(submission);

        return loadAnswers(submissionId);
    }

    // RETRIEVE PREVIOUSLY SAVED ANSWERS
    @Transactional(readOnly = true)
    public Map<String, String> getAnswers(
            Long submissionId,
            String firebaseUid
    ) {
        requireStudent(firebaseUid);

        Submission submission = submissionRepository
                .findById(submissionId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Submission not found."
                        )
                );

        requireOwner(submission, firebaseUid);

        return loadAnswers(submissionId);
    }

    private Map<String, String> loadAnswers(
            Long submissionId
    ) {
        Map<String, String> answers =
                new LinkedHashMap<>();

        List<SubmissionAnswer> savedAnswers =
                answerRepository
                        .findBySubmissionSubmissionId(
                                submissionId
                        );

        for (SubmissionAnswer answer : savedAnswers) {

            answers.put(
                    answer.getQuestionId(),
                    answer.getSelectedAnswer()
            );
        }

        return answers;
    }

    private void requireOwner(
            Submission submission,
            String firebaseUid
    ) {
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
