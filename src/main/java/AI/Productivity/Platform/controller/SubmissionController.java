package AI.Productivity.Platform.controller;

import AI.Productivity.Platform.dto.SubmissionRequest;
import AI.Productivity.Platform.dto.SubmissionResponse;
import AI.Productivity.Platform.service.SubmissionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping
    public SubmissionResponse submitCode(@RequestBody SubmissionRequest request) {
        // Temporarily hardcode a User ID string since Firebase Auth isn't fully linked
        String temporaryUserId = "test-user-id";
        return submissionService.processSubmission(temporaryUserId, request);
    }
}