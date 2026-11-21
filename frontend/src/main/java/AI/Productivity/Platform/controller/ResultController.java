package AI.Productivity.Platform.controller;

import AI.Productivity.Platform.entity.Result;
import AI.Productivity.Platform.service.ResultService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

    // ADMIN GETS ALL RESULTS
    // STUDENT GETS ONLY THEIR OWN RESULTS
    @GetMapping
    public ResponseEntity<List<Result>> getResults(
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid,
            Authentication authentication
    ) {

        String firebaseUid = requireUid(tokenUid);

        if (isAdmin(authentication)) {

            return ResponseEntity.ok(
                    resultService.getAllResults(firebaseUid)
            );
        }

        return ResponseEntity.ok(
                resultService.getMyResults(firebaseUid)
        );
    }

    // GET RESULTS FOR A SPECIFIC USER
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Result>> getUserResults(
            @PathVariable String userId,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid,
            Authentication authentication
    ) {

        String firebaseUid = requireUid(tokenUid);

        if (isAdmin(authentication)) {

            return ResponseEntity.ok(
                    resultService.getStudentResults(
                            firebaseUid,
                            userId
                    )
            );
        }

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

    // GET RESULTS FOR A SPECIFIC ASSESSMENT
    @GetMapping("/assessment/{assessmentId}")
    public ResponseEntity<List<Result>> getAssessmentResults(
            @PathVariable Integer assessmentId,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String tokenUid,
            Authentication authentication
    ) {

        String firebaseUid = requireUid(tokenUid);

        if (isAdmin(authentication)) {

            return ResponseEntity.ok(
                    resultService.getAllAssessmentResults(
                            firebaseUid,
                            assessmentId
                    )
            );
        }

        return ResponseEntity.ok(
                resultService.getMyAssessmentResults(
                        firebaseUid,
                        assessmentId
                )
        );
    }

    // CHECK VERIFIED SPRING SECURITY ROLE
    private boolean isAdmin(Authentication authentication) {

        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getAuthorities()
                    .stream()
                    .anyMatch(authority ->
                        "ROLE_ADMIN".equals(
                            authority.getAuthority()
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