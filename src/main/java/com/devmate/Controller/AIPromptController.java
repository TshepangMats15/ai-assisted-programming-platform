package com.devmate.Controller;

import com.devmate.Entities.AIInteraction;
import com.devmate.Services.AIPromptServices;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIPromptController {

    private final AIPromptServices promptService;

    public AIPromptController(AIPromptServices promptService) {
        this.promptService = promptService;
    }

    @PostMapping("/prompt")
    public ResponseEntity<?> submitPrompt(
            @RequestBody PromptRequest request) {

        try {
            AIInteraction interaction =
                    promptService.processPrompt(
                            request.getUserID(),
                            request.getAssessmentID(),
                            request.getPrompt()
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(interaction);

        } catch (IllegalStateException exception) {
            // AI Access restricted for Pre-Assessments (ai_allowed: false)
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", exception.getMessage()));

        } catch (IllegalArgumentException exception) {
            // Missing required parameters (userID, assessmentID, prompt)
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", exception.getMessage()));

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseEntity
                    .internalServerError()
                    .body(Map.of("error",
                            "Prompt failed: " + exception.getMessage()));
        }
    }

    @GetMapping("/interactions/user/{userID}")
    public ResponseEntity<List<AIInteraction>> getUserInteractions(
            @PathVariable String userID) {

        return ResponseEntity.ok(
                promptService.getUserInteractions(userID));
    }

    @GetMapping("/interactions/assessment/{assessmentID}")
    public ResponseEntity<List<AIInteraction>> getAssessmentInteractions(
            @PathVariable Integer assessmentID) {

        return ResponseEntity.ok(
                promptService.getAssessmentInteractions(assessmentID));
    }

    public static class PromptRequest {

        private String userID;
        private Integer assessmentID;
        private String prompt;

        public PromptRequest() {
        }

        public String getUserID() {
            return userID;
        }

        public void setUserID(String userID) {
            this.userID = userID;
        }

        public Integer getAssessmentID() {
            return assessmentID;
        }

        public void setAssessmentID(Integer assessmentID) {
            this.assessmentID = assessmentID;
        }

        public String getPrompt() {
            return prompt;
        }

        public void setPrompt(String prompt) {
            this.prompt = prompt;
        }
    }
}