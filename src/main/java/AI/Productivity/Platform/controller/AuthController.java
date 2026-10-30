package AI.Productivity.Platform.controller;

import AI.Productivity.Platform.dto.AuthRequest;
import AI.Productivity.Platform.dto.AuthResponse;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String ADMIN_EMAIL =
            "tshepangmatsane15@gmail.com";

    @PostMapping("/verify")
    public ResponseEntity<AuthResponse> verifyToken(
            @RequestBody AuthRequest request) {

        try {
            // Verify Firebase login token
            FirebaseToken decodedToken =
                    FirebaseAuth.getInstance()
                            .verifyIdToken(request.token());

            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();

            // Determine account role
            String role = ADMIN_EMAIL.equalsIgnoreCase(email)
                    ? "ADMIN"
                    : "STUDENT";

            return ResponseEntity.ok(
                    new AuthResponse(
                            uid,
                            role,
                            "Token verified successfully."
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            new AuthResponse(
                                    null,
                                    null,
                                    "Invalid token."
                            )
                    );
        }
    }
}
