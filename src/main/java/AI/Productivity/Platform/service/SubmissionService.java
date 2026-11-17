
package AI.Productivity.Platform.service;

import AI.Productivity.Platform.dto.SubmissionRequest;
import AI.Productivity.Platform.dto.SubmissionResponse;
import AI.Productivity.Platform.entity.Submission;
import AI.Productivity.Platform.repository.SubmissionRepository;

import com.devmate.Entities.Users;
import com.devmate.Entities.Assessment;

import com.devmate.Repository.UserRepository;
import com.devmate.Repository.AssessmentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final AssessmentRepository assessmentRepository;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            UserRepository userRepository,
            AssessmentRepository assessmentRepository
    ) {
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.assessmentRepository = assessmentRepository;
    }

    @Transactional
    public SubmissionResponse processSubmission(
            String userId,
            SubmissionRequest request
    ) {

        // 1. Validate the authenticated user.
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated user is required."
            );
        }

        // 2. Validate the submission request.
        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Submission request is required."
            );
        }

        if (request.assessmentId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Assessment ID is required."
            );
        }

        if (request.sourceCode() == null ||
                request.sourceCode().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Source code cannot be empty."
            );
        }

        // 3. Find the actual authenticated user.
        // Assumes Users.id stores the Firebase UID.
        Users user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Student account not found."
                        )
                );

        // 4. Find the requested assessment.
        Integer assessmentId = request.assessmentId();

        Assessment assessment =
                assessmentRepository.findById(assessmentId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Assessment not found."
                                )
                        );

        // 5. Save the submission without a fabricated score.
        LocalDateTime now = LocalDateTime.now();

        Submission submission = new Submission(
                user,
                assessment,
                request.sourceCode(),
                now,
                null
        );

        Submission savedSubmission =
                submissionRepository.save(submission);

        // Results must be created by trusted grading logic.
        // Do not automatically assign 100%.
        // Do not trust a score supplied by the student app.

        // 6. Return the saved submission details.
        return new SubmissionResponse(
                savedSubmission.getSubmissionId(),
                "Code successfully submitted.",
                now
        );
    }
}
