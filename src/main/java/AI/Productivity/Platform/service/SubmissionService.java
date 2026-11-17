
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

    // CREATE A NEW SUBMISSION
    @Transactional
    public SubmissionResponse processSubmission(
            String firebaseUid,
            SubmissionRequest request
    ) {
        if (firebaseUid == null || firebaseUid.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required."
            );
        }

        if (request == null
                || request.assessmentId() == null
                || request.sourceCode() == null
                || request.sourceCode().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Assessment ID and source code are required."
            );
        }

        // Find the student using their Firebase UID.
        Users user = userRepository
                .findByFirebaseUid(firebaseUid)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Student account not found in MySQL."
                        )
                );

        // Find the assessment.
        Assessment assessment = assessmentRepository
                .findById(request.assessmentId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Assessment not found."
                        )
                );

        LocalDateTime now = LocalDateTime.now();

        // JPA stores the related user's internal SQL ID.
        Submission submission = new Submission(
                user,
                assessment,
                request.sourceCode(),
                now,
                null
        );

        Submission savedSubmission =
                submissionRepository.save(submission);

        return new SubmissionResponse(
                savedSubmission.getSubmissionId(),
                "Code successfully submitted.",
                now
        );
    }

    // UPDATE AN EXISTING SUBMISSION
    @Transactional
    public SubmissionResponse updateSubmission(
            Long submissionId,
            String firebaseUid,
            String sourceCode
    ) {
        if (firebaseUid == null || firebaseUid.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required."
            );
        }

        if (sourceCode == null || sourceCode.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Source code cannot be empty."
            );
        }

        Submission submission = submissionRepository
                .findById(submissionId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Submission not found."
                        )
                );

        // Only the original owner can edit this submission.
        if (submission.getUser() == null
                || !firebaseUid.equals(
                        submission.getUser().getFirebaseUid()
                )) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot edit another student's submission."
            );
        }

        // Update the existing record, not create a new one.
        submission.setSourceCode(sourceCode);

        Submission savedSubmission =
                submissionRepository.save(submission);

        return new SubmissionResponse(
                savedSubmission.getSubmissionId(),
                "Code changes saved successfully.",
                LocalDateTime.now()
        );
    }
}
