
package com.devmate.Services;

import com.devmate.Entities.AIInteraction;
import com.devmate.Entities.Assessment;
import com.devmate.Repository.AIInteractionRepository;
import com.devmate.Repository.AssessmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AIPromptServices {

    private final AIInteractionRepository interactionRepository;
    private final AssessmentRepository assessmentRepository;
    private final GeminiService geminiService;

    public AIPromptServices(
            AIInteractionRepository interactionRepository,
            AssessmentRepository assessmentRepository,
            GeminiService geminiService) {

        this.interactionRepository = interactionRepository;
        this.assessmentRepository = assessmentRepository;
        this.geminiService = geminiService;
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

        // Validate assessment and check AI gating permission
        Assessment assessment = assessmentRepository.findById(assessmentID)
                .orElseThrow(() -> new RuntimeException(
                        "Assessment not found with ID: " + assessmentID));

        if (Boolean.FALSE.equals(assessment.getAiAllowed())) {
            throw new IllegalStateException(
                    "AI assistance is disabled during Diagnostic Pre-Assessments.");
        }

        long startTime = System.nanoTime();

        AIInteraction interaction = new AIInteraction();

        interaction.setUserID(userID);
        interaction.setAssessmentID(assessmentID);
        interaction.setPrompt(prompt);

        try {
            String response = geminiService.askGemini(prompt);

            interaction.setResponse(response);
            interaction.setStatus("SUCCESS");
            interaction.setErrorMessage(null);

        } catch (Exception exception) {

            interaction.setResponse(null);
            interaction.setStatus("FAILED");

            String errorMessage = exception.getMessage();

            interaction.setErrorMessage(
                    errorMessage != null
                            ? errorMessage
                            : "Unknown AI processing error");
        } finally {

            long processingTimeMs =
                    (System.nanoTime() - startTime) / 1_000_000;

            interaction.setProcessingTimeMs(processingTimeMs);
        }

        return interactionRepository.save(interaction);
    }

    public List<AIInteraction> getUserInteractions(
            String userID) {

        return interactionRepository.findByUserID(userID);
    }

    public List<AIInteraction> getAssessmentInteractions(
            Integer assessmentID) {

        return interactionRepository.findByAssessmentID(
                assessmentID);
    }
}