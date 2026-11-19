
package AI.Productivity.Platform.config;

import com.google.api.client.http.javanet.NetHttpTransport;
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

        String json = System.getenv(
                "FIREBASE_SERVICE_ACCOUNT_JSON"
        );

        if (json == null || json.isBlank()) {
            throw new IllegalStateException(
                    "FIREBASE_SERVICE_ACCOUNT_JSON is missing"
            );
        }

        try {

            NetHttpTransport httpTransport =
                    new NetHttpTransport();

            GoogleCredentials credentials =
                    GoogleCredentials.fromStream(
                            new ByteArrayInputStream(
                                    json.getBytes(
                                            StandardCharsets.UTF_8
                                    )
                            ),
                            () -> httpTransport
                    );

            FirebaseOptions options =
                    FirebaseOptions.builder()
                            .setCredentials(credentials)
                            .setProjectId("itdma-28c29")
                            .setHttpTransport(httpTransport)
                            .build();

            FirebaseApp.initializeApp(options);

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Firebase initialization failed", e
            );
        }
    }
}
