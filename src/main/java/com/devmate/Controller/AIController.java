package com.devmate.Controller;


import com.devmate.Services.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AIController {
    private final GeminiService geminiService;
    public AIController(GeminiService geminiService) {
            this.geminiService = geminiService;
        }
    @PostMapping("/ask")
    public ResponseEntity<String> askGemini(
            @RequestBody AIRequests request) {
        String response =
                geminiService.askGemini(request.getPrompt());
        return ResponseEntity.ok(response);
        }
    }

