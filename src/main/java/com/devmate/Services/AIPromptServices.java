package com.devmate.Services;

import com.devmate.Entities.AIInteraction;
import com.devmate.Repository.AIInteractionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AIPromptServices {

    private final AIInteractionRepository interactionRepository;

    public AIPromptServices(
            AIInteractionRepository interactionRepository) {
        this.interactionRepository = interactionRepository;
    }

    @Transactional
    public AIInteraction processPrompt(
            String userID,
            Integer assessmentID,
            String prompt) {

        if (userID == null || userID.isBlank()) {
            throw new IllegalArgumentException(
                    "User ID is required.");
        }

        if (assessmentID == null) {
            throw new IllegalArgumentException(
                    "Assessment ID is required.");
        }

        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException(
                    "Prompt cannot be empty.");
        }

        long startTime = System.nanoTime();

        AIInteraction interaction = new AIInteraction();

        interaction.setUserID(userID);
        interaction.setAssessmentID(assessmentID);
        interaction.setPrompt(prompt);

        try {
            // Simulated response until Gemini is integrated.
            String response = generateResponse(prompt);

            interaction.setResponse(response);
            interaction.setStatus("SUCCESS");
            interaction.setErrorMessage(null);

        } catch (Exception exception) {
            interaction.setResponse(null);
            interaction.setStatus("FAILED");
            interaction.setErrorMessage(
                    exception.getMessage() != null
                            ? exception.getMessage()
                            : "Unknown AI processing error");
        } finally {
            long processingTimeMs =
                    (System.nanoTime() - startTime) / 1_000_000;

            interaction.setProcessingTimeMs(processingTimeMs);
        }

        // Save the interaction and its log details.
        return interactionRepository.save(interaction);
    }

    private String generateResponse(String prompt) {
        return "SIMULATED RESPONSE: Your prompt was received: "
                + prompt
                + ". A real AI-generated response will be available "
                + "after Gemini API integration.";
    }

    public List<AIInteraction> getUserInteractions(String userID) {
        return interactionRepository.findByUserID(userID);
    }

    public List<AIInteraction> getAssessmentInteractions(
            Integer assessmentID) {
        return interactionRepository.findByAssessmentID(assessmentID);
    }
}
