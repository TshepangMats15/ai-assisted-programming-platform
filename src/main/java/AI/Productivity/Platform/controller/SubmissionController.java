package AI.Productivity.Platform.controller;

import AI.Productivity.Platform.dto.SubmissionRequest;
import AI.Productivity.Platform.dto.SubmissionResponse;
import AI.Productivity.Platform.entity.Submission;
import AI.Productivity.Platform.repository.SubmissionRepository;
import AI.Productivity.Platform.service.SubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final SubmissionRepository submissionRepository;

    public SubmissionController(SubmissionService submissionService,
                                SubmissionRepository submissionRepository) {
        this.submissionService = submissionService;
        this.submissionRepository = submissionRepository;
    }

    @PostMapping
    public ResponseEntity<SubmissionResponse> submitCode(
            @RequestBody SubmissionRequest request,
            @RequestAttribute(value = "uid", required = false) String tokenUid,
            @RequestHeader(value = "X-User-ID", required = false) String headerUserId) {

        // Resolve user: from Firebase Auth token attribute, custom header, or default dev fallback
        String resolvedUserId = tokenUid != null ? tokenUid :
                (headerUserId != null && !headerUserId.isBlank() ? headerUserId : "test-user-id");

        SubmissionResponse response = submissionService.processSubmission(resolvedUserId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Submission>> getAllSubmissions() {
        return ResponseEntity.ok(submissionRepository.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Submission>> getUserSubmissions(@PathVariable String userId) {
        return ResponseEntity.ok(submissionRepository.findByUserId(userId));
    }

    @GetMapping("/{submissionId}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable Long submissionId) {
        return submissionRepository.findById(submissionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}