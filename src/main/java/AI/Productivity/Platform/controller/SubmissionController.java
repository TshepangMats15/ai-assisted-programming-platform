
package AI.Productivity.Platform.controller;

import AI.Productivity.Platform.dto.SubmissionRequest;
import AI.Productivity.Platform.dto.SubmissionResponse;
import AI.Productivity.Platform.dto.ResultResponse;

import AI.Productivity.Platform.entity.Submission;

import AI.Productivity.Platform.repository.SubmissionRepository;

import AI.Productivity.Platform.service.SubmissionService;
import AI.Productivity.Platform.service.GradingService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final SubmissionRepository submissionRepository;
    private final GradingService gradingService;

    public SubmissionController(
            SubmissionService submissionService,
            SubmissionRepository submissionRepository,
            GradingService gradingService
    ) {
        this.submissionService = submissionService;
        this.submissionRepository = submissionRepository;
        this.gradingService = gradingService;
    }

    // CREATE OR SAVE A DRAFT
    @PostMapping({"", "/draft"})
    public ResponseEntity<SubmissionResponse> saveDraft(
            @RequestBody SubmissionRequest request,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        String firebaseUid = requireUid(tokenUid);

        return ResponseEntity.ok(
                submissionService.processSubmission(
                        firebaseUid,
                        request
                )
        );
    }

    // RETRIEVE SAVED DRAFT BY ASSESSMENT
    @GetMapping("/draft/{assessmentId}")
    public ResponseEntity<Submission> getDraft(
            @PathVariable Integer assessmentId,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        String firebaseUid = requireUid(tokenUid);

        return ResponseEntity.ok(
                submissionService.getDraft(
                        firebaseUid,
                        assessmentId
                )
        );
    }

    // GET THE AUTHENTICATED STUDENT'S SUBMISSIONS
    @GetMapping
    public ResponseEntity<List<Submission>> getAllSubmissions(
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        String firebaseUid = requireUid(tokenUid);

        return ResponseEntity.ok(
                submissionRepository
                        .findByFirebaseUid(firebaseUid)
                        .stream()
                        .filter(submission ->
                                submission.getUser() != null &&
                                firebaseUid.equals(
                                        submission.getUser()
                                                .getFirebaseUid()
                                )
                        )
                        .toList()
        );
    }

    // COMPATIBILITY ENDPOINT
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Submission>> getUserSubmissions(
            @PathVariable String userId,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        String firebaseUid = requireUid(tokenUid);

        if (!firebaseUid.equals(userId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot view another student's submissions."
            );
        }

        return getAllSubmissions(tokenUid);
    }

    // GET ONE SUBMISSION
    @GetMapping("/{submissionId}")
    public ResponseEntity<Submission> getSubmissionById(
            @PathVariable Long submissionId,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        String firebaseUid = requireUid(tokenUid);

        Submission submission = submissionRepository
                .findById(submissionId)
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
                    "You cannot view another student's submission."
            );
        }

        return ResponseEntity.ok(submission);
    }

    // UPDATE SAVED CODE
    @PutMapping({
            "/{submissionId}",
            "/{submissionId}/code"
    })
    public ResponseEntity<SubmissionResponse> updateSubmission(
            @PathVariable Long submissionId,
            @RequestBody Map<String, String> body,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        String firebaseUid = requireUid(tokenUid);

        String sourceCode = body == null
                ? null
                : body.get("sourceCode");

        return ResponseEntity.ok(
                submissionService.updateSubmission(
                        submissionId,
                        firebaseUid,
                        sourceCode
                )
        );
    }

    // AUTOMATICALLY GRADE A FINALISED ASSESSMENT
    @PostMapping("/{submissionId}/grade")
    public ResponseEntity<ResultResponse> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        String firebaseUid = requireUid(tokenUid);

        ResultResponse response =
                gradingService.gradeSubmission(
                        submissionId,
                        firebaseUid
                );

        return ResponseEntity.ok(response);
    }

    // REQUIRE VERIFIED FIREBASE AUTHENTICATION
    private String requireUid(String tokenUid) {

        if (tokenUid == null || tokenUid.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required."
            );
        }

        return tokenUid;
    }
}
