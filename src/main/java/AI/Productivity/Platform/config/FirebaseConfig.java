
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

    private static final String FIREBASE_PROJECT_ID = "itdma-28c29";

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
                            .setProjectId(FIREBASE_PROJECT_ID)
                            .build();

            FirebaseApp.initializeApp(options);

            System.out.println(
                    "Firebase Admin SDK initialized for project: "
                            + FIREBASE_PROJECT_ID
            );

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Firebase Admin SDK initialization failed.",
                    e
            );
        }
    }
}


