
package AI.Productivity.Platform.controller;

import AI.Productivity.Platform.dto.SubmissionRequest;
import AI.Productivity.Platform.dto.SubmissionResponse;
import AI.Productivity.Platform.entity.Submission;
import AI.Productivity.Platform.repository.SubmissionRepository;
import AI.Productivity.Platform.service.SubmissionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final SubmissionRepository submissionRepository;

    public SubmissionController(
            SubmissionService submissionService,
            SubmissionRepository submissionRepository
    ) {
        this.submissionService = submissionService;
        this.submissionRepository = submissionRepository;
    }

    @PostMapping
    public ResponseEntity<SubmissionResponse> submitCode(
            @RequestBody SubmissionRequest request,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {

        // Only accept a verified Firebase user.
        if (tokenUid == null || tokenUid.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        // Validate the request before saving.
        if (request == null ||
                request.assessmentId() == null ||
                request.sourceCode() == null ||
                request.sourceCode().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }

        SubmissionResponse response =
                submissionService.processSubmission(
                        tokenUid,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<Submission>> getAllSubmissions() {
        return ResponseEntity.ok(
                submissionRepository.findAll()
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Submission>> getUserSubmissions(
            @PathVariable String userId
    ) {
        return ResponseEntity.ok(
                submissionRepository.findByUserId(userId)
        );
    }

    @GetMapping("/{submissionId}")
    public ResponseEntity<Submission> getSubmissionById(
            @PathVariable Long submissionId
    ) {
        return submissionRepository.findById(submissionId)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    @PutMapping("/{submissionId}")
public ResponseEntity<SubmissionResponse> updateSubmission(
        @PathVariable Long submissionId,
        @RequestBody Map<String, String> body,
        @RequestAttribute(
                value = "uid",
                required = false
        ) String tokenUid
) {
    if (tokenUid == null || tokenUid.isBlank()) {
        return ResponseEntity.status(
                HttpStatus.UNAUTHORIZED
        ).build();
    }

    String sourceCode = body == null
            ? null
            : body.get("sourceCode");

    SubmissionResponse response =
            submissionService.updateSubmission(
                    submissionId,
                    tokenUid,
                    sourceCode
            );

    return ResponseEntity.ok(response);
}
}
