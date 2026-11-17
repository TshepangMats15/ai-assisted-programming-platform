
package AI.Productivity.Platform.controller;

import AI.Productivity.Platform.dto.SubmissionRequest;
import AI.Productivity.Platform.dto.SubmissionResponse;
import AI.Productivity.Platform.dto.GradeSubmissionRequest;
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

    // CREATE A NEW SUBMISSION
    @PostMapping
    public ResponseEntity<SubmissionResponse> submitCode(
            @RequestBody SubmissionRequest request,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        String firebaseUid = requireUid(tokenUid);

        if (request == null
                || request.assessmentId() == null
                || request.sourceCode() == null
                || request.sourceCode().isBlank()) {

            return ResponseEntity.badRequest().build();
        }

        SubmissionResponse response =
                submissionService.processSubmission(
                        firebaseUid,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // GET ONLY THE LOGGED-IN STUDENT'S SUBMISSIONS
    @GetMapping
    public ResponseEntity<List<Submission>> getAllSubmissions(
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        String firebaseUid = requireUid(tokenUid);

        return ResponseEntity.ok(
                submissionRepository.findByFirebaseUid(
                        firebaseUid
                )
        );
    }

    // GET SUBMISSIONS BY FIREBASE UID
    // STUDENTS CANNOT REQUEST ANOTHER USER'S RECORDS
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
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        return ResponseEntity.ok(
                submissionRepository.findByFirebaseUid(
                        firebaseUid
                )
        );
    }

    // GET ONE SUBMISSION
    // VERIFY THAT THE STUDENT OWNS IT
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

        if (submission.getUser() == null
                || !firebaseUid.equals(
                        submission.getUser().getFirebaseUid()
                )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot view another student's submission."
            );
        }

        return ResponseEntity.ok(submission);
    }

    // UPDATE AN EXISTING SUBMISSION
    // THE SAME MYSQL ROW IS UPDATED
    @PutMapping("/{submissionId}")
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

        SubmissionResponse response =
                submissionService.updateSubmission(
                        submissionId,
                        firebaseUid,
                        sourceCode
                );

        return ResponseEntity.ok(response);
    }

    // AUTOMATICALLY GRADE A SAVED SUBMISSION
    // CODING: 50% | MULTIPLE CHOICE: 50%
    @PostMapping("/{submissionId}/grade")
    public ResponseEntity<ResultResponse> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody GradeSubmissionRequest request,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        String firebaseUid = requireUid(tokenUid);

        ResultResponse response =
                gradingService.gradeSubmission(
                        submissionId,
                        firebaseUid,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // REQUIRE A VERIFIED FIREBASE UID
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
