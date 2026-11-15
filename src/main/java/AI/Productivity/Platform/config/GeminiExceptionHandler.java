
package AI.Productivity.Platform.config;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GeminiExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GeminiExceptionHandler.class);

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        log.error("Backend runtime exception", ex);

        String msg = ex.getMessage() == null
                ? ""
                : ex.getMessage();

        if (msg.contains("429") ||
                msg.contains("RESOURCE_EXHAUSTED")) {
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                            "error",
                            "AI quota reached. Please try again later."
                    ));
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error",
                        "Something went wrong."
                ));
    }
}
