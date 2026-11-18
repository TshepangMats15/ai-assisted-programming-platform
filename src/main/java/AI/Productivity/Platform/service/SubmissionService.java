
package AI.Productivity.Platform.service;

import AI.Productivity.Platform.dto.SubmissionRequest;
import AI.Productivity.Platform.dto.SubmissionResponse;
import AI.Productivity.Platform.entity.Submission;
import AI.Productivity.Platform.entity.SubmissionStatus;
import AI.Productivity.Platform.repository.SubmissionRepository;

import com.devmate.Entities.Users;
import com.devmate.Entities.Assessment;
import com.devmate.Repository.UserRepository;
import com.devmate.Repository.AssessmentRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final AssessmentRepository assessmentRepository;
    private final EntityManager entityManager;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            UserRepository userRepository,
            AssessmentRepository assessmentRepository,
            EntityManager entityManager
    ) {
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.assessmentRepository = assessmentRepository;
        this.entityManager = entityManager;
    }

    // CREATE OR UPDATE A DRAFT
    @Transactional
    public SubmissionResponse processSubmission(
            String firebaseUid,
            SubmissionRequest request
    ) {
        Users user = requireUser(firebaseUid);

        if (request == null ||
                request.assessmentId() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Assessment ID is required."
            );
        }

        String sourceCode = request.sourceCode();

        if (sourceCode != null) {
            validateCode(sourceCode);
        }

        // Serialize draft creation for this student.
        entityManager.lock(
                user,
                LockModeType.PESSIMISTIC_WRITE
        );

        Assessment assessment = assessmentRepository
                .findById(request.assessmentId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Assessment not found."
                        )
                );

        List<Submission> drafts =
                submissionRepository.findDrafts(
                        firebaseUid,
                        request.assessmentId(),
                        SubmissionStatus.DRAFT
                );

        if (drafts.size() > 1) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Multiple drafts exist for this assessment."
            );
        }

        LocalDateTime now = LocalDateTime.now();

        Submission submission;

        if (!drafts.isEmpty()) {

            submission = requireOwnedSubmissionForUpdate(
                    drafts.get(0).getSubmissionId(),
                    firebaseUid
            );

            requireDraft(submission);

            if (sourceCode != null) {
                submission.setSourceCode(sourceCode);
            }

        } else {

            submission = new Submission(
                    user,
                    assessment,
                    sourceCode,
                    now,
                    null
            );

            submission.setStatus(
                    SubmissionStatus.DRAFT
            );
        }

        submission.setSavedAt(now);

        Submission saved =
                submissionRepository.save(submission);

        return new SubmissionResponse(
                saved.getSubmissionId(),
                "Draft saved successfully.",
                now
        );
    }

    // RETRIEVE AN EXISTING DRAFT
    @Transactional(readOnly = true)
    public Submission getDraft(
            String firebaseUid,
            Integer assessmentId
    ) {
        requireUser(firebaseUid);

        List<Submission> drafts =
                submissionRepository.findDrafts(
                        firebaseUid,
                        assessmentId,
                        SubmissionStatus.DRAFT
                );

        if (drafts.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No saved draft found."
            );
        }

        if (drafts.size() > 1) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Multiple drafts exist for this assessment."
            );
        }

        return drafts.get(0);
    }

    // SAVE CHANGES TO EXISTING CODE
    @Transactional
    public SubmissionResponse updateSubmission(
            Long submissionId,
            String firebaseUid,
            String sourceCode
    ) {
        requireUser(firebaseUid);
        validateCode(sourceCode);

        Submission submission =
                requireOwnedSubmissionForUpdate(
                        submissionId,
                        firebaseUid
                );

        requireDraft(submission);

        LocalDateTime now = LocalDateTime.now();

        submission.setSourceCode(sourceCode);
        submission.setSavedAt(now);

        submissionRepository.save(submission);

        return new SubmissionResponse(
                submission.getSubmissionId(),
                "Code saved successfully.",
                now
        );
    }

    // AUTHENTICATED STUDENT LOOKUP
    private Users requireUser(String firebaseUid) {

        if (firebaseUid == null ||
                firebaseUid.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required."
            );
        }

        Users user = userRepository
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

        return user;
    }

    // LOAD AND LOCK THE STUDENT'S SUBMISSION
    private Submission requireOwnedSubmissionForUpdate(
            Long submissionId,
            String firebaseUid
    ) {
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

    // ONLY DRAFTS MAY BE EDITED
    private void requireDraft(Submission submission) {

        if (submission.getStatus() !=
                SubmissionStatus.DRAFT) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This submission is locked and cannot be edited."
            );
        }
    }

    // VALIDATE SOURCE CODE
    private void validateCode(String sourceCode) {

        if (sourceCode == null ||
                sourceCode.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Source code cannot be empty."
            );
        }

        if (sourceCode.length() > 50_000 ||
                sourceCode.getBytes(
                        StandardCharsets.UTF_8
                ).length > 65_535) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Source code exceeds the maximum size."
            );
        }
    }
}
