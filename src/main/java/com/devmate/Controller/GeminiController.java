package com.devmate.Controller;

import com.devmate.Entities.AIInteraction;
import com.devmate.Entities.Assessment;
import com.devmate.Entities.Users;
import com.devmate.Repository.AIInteractionRepository;
import com.devmate.Repository.AssessmentRepository;
import com.devmate.Repository.UserRepository;
import com.devmate.Services.GeminiService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping({"/api/gemini", "/api/ai"})
public class GeminiController {

    private final GeminiService geminiService;
    private final AIInteractionRepository interactionRepository;
    private final UserRepository userRepository;
    private final AssessmentRepository assessmentRepository;

    public GeminiController(
            GeminiService geminiService,
            AIInteractionRepository interactionRepository,
            UserRepository userRepository,
            AssessmentRepository assessmentRepository
    ) {
        this.geminiService = geminiService;
        this.interactionRepository = interactionRepository;
        this.userRepository = userRepository;
        this.assessmentRepository = assessmentRepository;
    }

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askGemini(
            @RequestBody AIRequests request,
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String firebaseUid
    ) {

        if (firebaseUid == null || firebaseUid.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required."
            );
        }

        Users user = userRepository
                .findByFirebaseUid(firebaseUid)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User account not found."
                        )
                );

        String prompt = request.getPrompt();

        if (prompt == null || prompt.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Prompt must not be empty."
            );
        }

        Integer assessmentId = request.getAssessmentId();

        // GENERAL AI ASSISTANCE
        // Do not include general conversations in assessment analytics.
        if (assessmentId == null) {
            return ResponseEntity.ok(
                    Map.of("response", geminiService.askGemini(prompt))
            );
        }

        // ASSESSMENT AI ASSISTANCE
        if (!"STUDENT".equals(user.getRole())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Student access required."
            );
        }

        Assessment assessment = assessmentRepository
                .findById(assessmentId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Assessment not found."
                        )
                );

        if (!Boolean.TRUE.equals(assessment.getAiAllowed())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "AI assistance is disabled for this assessment."
            );
        }

        long start = System.currentTimeMillis();

        // Call Gemini
        String response = geminiService.askGemini(prompt);

        // Record successful assessment AI usage
        AIInteraction interaction = new AIInteraction();

        interaction.setUserID(user.getId());
        interaction.setAssessmentID(assessmentId);
        interaction.setPrompt(prompt);
        interaction.setResponse(response);
        interaction.setStatus("SUCCESS");
        interaction.setProcessingTimeMs(
                System.currentTimeMillis() - start
        );

        interactionRepository.save(interaction);

        return ResponseEntity.ok(
                Map.of("response", response)
        );
    }
}