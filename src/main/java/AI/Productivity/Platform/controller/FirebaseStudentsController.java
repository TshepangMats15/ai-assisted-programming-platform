
package AI.Productivity.Platform.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.ListUsersPage;
import com.google.firebase.auth.UserRecord;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/admin")
public class FirebaseStudentsController {

    private static final Logger log =
        LoggerFactory.getLogger(FirebaseStudentsController.class);

    @Value("${devmate.admin.email}")
    private String adminEmail;

    @GetMapping("/students")
    public ResponseEntity<?> getStudents(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authorization
    ) throws FirebaseAuthException {

        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        FirebaseToken token;

        try {
            token = FirebaseAuth.getInstance()
                    .verifyIdToken(
                            authorization.substring(7).trim(),
                            true
                    );
        } catch (FirebaseAuthException e) {
    log.warn(
        "Firebase token verification failed: code={}, message={}",
        e.getAuthErrorCode(),
        e.getMessage()
    );

    return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("message", "Invalid Firebase token"));
}

        // Use Firebase's verified user record, not a client-supplied email.
        UserRecord caller = FirebaseAuth.getInstance()
                .getUser(token.getUid());

        if (caller.isDisabled() ||
                !caller.isEmailVerified() ||
                caller.getEmail() == null ||
                !caller.getEmail().equalsIgnoreCase(adminEmail)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Admin access required"));
        }

        List<Map<String, String>> students = new ArrayList<>();

        ListUsersPage page =
                FirebaseAuth.getInstance().listUsers(null);

        while (page != null) {
            for (UserRecord user : page.getValues()) {

                String email = user.getEmail();

                if (email == null ||
                        email.equalsIgnoreCase(adminEmail)) {
                    continue;
                }

                String name = user.getDisplayName();

                if (name == null || name.isBlank()) {
                    name = email.split("@")[0];
                }

                students.add(Map.of(
                        "id", user.getUid(),
                        "fullName", name,
                        "email", email,
                        "role", "STUDENT"
                ));
            }

            page = page.getNextPage();
        }

        return ResponseEntity.ok(students);
    }
}
