
package com.devmate.Controller;

import com.devmate.Services.CoderunServices;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/code")
public class CoderunController {

    private final CoderunServices coderunServices;

    public CoderunController(CoderunServices coderunServices) {
        this.coderunServices = coderunServices;
    }

    @PostMapping("/run")
    public ResponseEntity<?> runCode(
            @RequestBody Map<String, String> request) {

        try {

            Map<String, Object> result = coderunServices.run(
                    request.get("language"),
                    request.get("sourceCode"),
                    request.get("stdin")
            );

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );

        } catch (IllegalStateException e) {

            return ResponseEntity.status(502).body(
                    Map.of("error", e.getMessage()));

        } catch (Exception e) {

            return ResponseEntity.internalServerError().body(
                    Map.of("error", "An unexpected error occurred while running your code."
                    )
            );
        }
    }
}
