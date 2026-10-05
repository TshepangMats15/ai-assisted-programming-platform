package AI.Productivity.Platform.controller;

import AI.Productivity.Platform.dto.AIRequest;
import AI.Productivity.Platform.dto.AIResponse;
import AI.Productivity.Platform.service.AIInteractionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIInteractionService aiService;

    public AIController(AIInteractionService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public AIResponse chatWithAi(@RequestBody AIRequest request) {
        // Temporarily hardcode a User ID since Member 3's Auth is not ready
        Long temporaryUserId = 1L;
        return aiService.processMockAiRequest(temporaryUserId, request);
    }
}
