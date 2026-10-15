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

    @PostMapping("/verify")
    public ResponseEntity<AuthResponse> verifyToken(@RequestBody AuthRequest request) {
        try {
            // This contacts Google's servers using your JSON key to verify the token
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.token());
            String uid = decodedToken.getUid();

            return ResponseEntity.ok(new AuthResponse(uid, "Token verified successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, "Invalid token: " + e.getMessage()));
        }
    }
}
