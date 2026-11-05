
package AI.Productivity.Platform.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initializeFirebase() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        String serviceAccountJson =
                System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON");

        if (serviceAccountJson == null ||
                serviceAccountJson.isBlank()) {
            throw new IllegalStateException(
                    "Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable."
            );
        }

        try {
            GoogleCredentials credentials =
                    GoogleCredentials.fromStream(
                            new ByteArrayInputStream(
                                    serviceAccountJson.getBytes(
                                            StandardCharsets.UTF_8
                                    )
                            )
                    );

            FirebaseOptions options =
                    FirebaseOptions.builder()
                            .setCredentials(credentials)
                            .build();

            FirebaseApp.initializeApp(options);

            System.out.println(
                    "Firebase Admin SDK initialized successfully."
            );

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Firebase Admin SDK initialization failed.",
                    e
            );
        }
    }
}

