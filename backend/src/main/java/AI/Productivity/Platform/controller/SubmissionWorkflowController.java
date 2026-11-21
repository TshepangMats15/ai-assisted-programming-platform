
package AI.Productivity.Platform.controller;

import AI.Productivity.Platform.dto.SubmissionAnswerRequest;

import AI.Productivity.Platform.entity.Submission;

import AI.Productivity.Platform.service.SubmissionAnswerService;
import AI.Productivity.Platform.service.SubmissionFinalizationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionWorkflowController {

    private final SubmissionAnswerService answerService;

    private final SubmissionFinalizationService
            finalizationService;

    public SubmissionWorkflowController(
            SubmissionAnswerService answerService,
            SubmissionFinalizationService finalizationService
    ) {
        this.answerService = answerService;
        this.finalizationService = finalizationService;
    }

    // SAVE MULTIPLE-CHOICE ANSWERS
    @PutMapping("/{submissionId}/answers")
    public ResponseEntity<Map<String, String>> saveAnswers(
            @PathVariable Long submissionId,
            @RequestBody SubmissionAnswerRequest request,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        String firebaseUid = requireUid(tokenUid);

        if (request == null ||
                request.mcqAnswers() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Multiple-choice answers are required."
            );
        }

        return ResponseEntity.ok(
                answerService.saveAnswers(
                        submissionId,
                        firebaseUid,
                        request.mcqAnswers()
                )
        );
    }

    // RETRIEVE SAVED ANSWERS
    @GetMapping("/{submissionId}/answers")
    public ResponseEntity<Map<String, String>> getAnswers(
            @PathVariable Long submissionId,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        return ResponseEntity.ok(
                answerService.getAnswers(
                        submissionId,
                        requireUid(tokenUid)
                )
        );
    }

    // FINALISE AND LOCK THE ASSESSMENT
    @PostMapping("/{submissionId}/submit")
    public ResponseEntity<Submission> finalizeSubmission(
            @PathVariable Long submissionId,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        return ResponseEntity.ok(
                finalizationService.finalizeSubmission(
                        submissionId,
                        requireUid(tokenUid)
                )
        );
    }

    private String requireUid(String tokenUid) {

        if (tokenUid == null ||
                tokenUid.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required."
            );
        }

        return tokenUid;
    }
}
