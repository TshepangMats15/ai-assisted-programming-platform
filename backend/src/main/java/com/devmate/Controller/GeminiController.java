package com.devmate.Controller;

import com.devmate.Services.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.devmate.Entities.AIInteraction;
import com.devmate.Repository.AIInteractionRepository;
import java.util.Map;

@RestController
@RequestMapping({"/api/gemini", "/api/ai"})
public class GeminiController {

    private final GeminiService geminiService;
    private final AIInteractionRepository interactionRepository;

    public GeminiController(GeminiService geminiService,
                            AIInteractionRepository interactionRepository) {
        this.geminiService = geminiService;
        this.interactionRepository = interactionRepository;
    }

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askGemini(@RequestBody AIRequests request) {

        String prompt = request.getPrompt();

        if (prompt == null || prompt.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Prompt must not be empty."));
        }

        long start = System.currentTimeMillis();

        AIInteraction interaction = new AIInteraction();
        interaction.setUserID(request.getUserId());
        interaction.setAssessmentID(request.getAssessmentId());
        interaction.setPrompt(prompt);

        try {
            String response = geminiService.askGemini(prompt);

            interaction.setResponse(response);
            interaction.setStatus("SUCCESS");
            saveInteraction(interaction, start);

            return ResponseEntity.ok(Map.of("response", response));

        } catch (IllegalArgumentException e) {
            interaction.setStatus("FAILED");
            interaction.setErrorMessage(e.getMessage());
            saveInteraction(interaction, start);

            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();   // full trace in the Spring console

            interaction.setStatus("FAILED");
            interaction.setErrorMessage(e.getMessage());
            saveInteraction(interaction, start);

            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Gemini request failed: " + e.getMessage()));
        }
    }

    // Saves the interaction for analytics. Never lets a save problem break the AI response.
    private void saveInteraction(AIInteraction interaction, long start) {
        // The table requires userID and assessmentID, so skip if the frontend didn't send them
        if (interaction.getUserID() == null || interaction.getAssessmentID() == null) {
            return;
        }
        try {
            interaction.setProcessingTimeMs(System.currentTimeMillis() - start);
            interactionRepository.save(interaction);   // timestamp is set by @PrePersist
        } catch (Exception e) {
            System.err.println("Could not save AI interaction: " + e.getMessage());
        }
    }
}