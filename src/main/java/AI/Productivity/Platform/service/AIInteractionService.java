package AI.Productivity.Platform.service;

import AI.Productivity.Platform.dto.AIRequest;
import AI.Productivity.Platform.dto.AIResponse;
import AI.Productivity.Platform.entity.AIInteraction;
import AI.Productivity.Platform.repository.AIInteractionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AIInteractionService {

    private final AIInteractionRepository repository;

    // Spring automatically injects the repository here (Dependency Injection)
    public AIInteractionService(AIInteractionRepository repository) {
        this.repository = repository;
    }

    public AIResponse processMockAiRequest(Long userId, AIRequest request) {
        // 1. Mock the Gemini response so the frontend team can work
        String mockAnswer = "This is a mock AI response for your prompt: '" + request.prompt() + "'";
        LocalDateTime now = LocalDateTime.now();

        // 2. Save the interaction to the database for your research analytics
        AIInteraction interaction = new AIInteraction(
                userId,
                request.assessmentId(),
                request.prompt(),
                mockAnswer,
                now
        );
        repository.save(interaction);

        // 3. Return the formatted response t
        // the React Native frontend
        return new AIResponse(mockAnswer, now);
    }
}
