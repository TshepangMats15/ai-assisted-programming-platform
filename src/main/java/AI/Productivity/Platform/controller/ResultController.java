
package AI.Productivity.Platform.controller;

import AI.Productivity.Platform.entity.Result;
import AI.Productivity.Platform.service.ResultService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    // GET RESULTS FOR THE LOGGED-IN STUDENT
    @GetMapping
    public ResponseEntity<List<Result>> getMyResults(
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        String firebaseUid = requireUid(tokenUid);

        return ResponseEntity.ok(
                resultService.getMyResults(firebaseUid)
        );
    }

    // COMPATIBILITY ROUTE FOR EXISTING FRONTEND REQUESTS
    // USER ID MUST MATCH THE VERIFIED FIREBASE UID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Result>> getUserResults(
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
                    "You cannot view another student's results."
            );
        }

        return ResponseEntity.ok(
                resultService.getMyResults(firebaseUid)
        );
    }

    // GET THE LOGGED-IN STUDENT'S RESULTS FOR ONE ASSESSMENT
    @GetMapping("/assessment/{assessmentId}")
    public ResponseEntity<List<Result>> getMyAssessmentResults(
            @PathVariable Integer assessmentId,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid
    ) {
        String firebaseUid = requireUid(tokenUid);

        return ResponseEntity.ok(
                resultService.getMyAssessmentResults(
                        firebaseUid,
                        assessmentId
                )
        );
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
