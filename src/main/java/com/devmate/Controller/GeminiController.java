package com.devmate.Controller;

import com.devmate.Services.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping({"/api/gemini", "/api/ai"})
public class GeminiController {

    private final GeminiService geminiService;

    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askGemini(@RequestBody AIRequests request) {

        String prompt = request.getPrompt();

        if (prompt == null || prompt.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Prompt must not be empty."));
        }

        try {
            String response = geminiService.askGemini(prompt);
            return ResponseEntity.ok(Map.of("response", response));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();   // full trace in the Spring console
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Gemini request failed: " + e.getMessage()));
        }
    }
}