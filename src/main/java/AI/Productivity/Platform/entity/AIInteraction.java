package AI.Productivity.Platform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_interactions")
public class AIInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interaction_id")
    private Long interactionId;

    // We use Long for now to prevent compilation errors until Member 3 creates the User entity.
    // Later, we will change this to a @ManyToOne User object.
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // We use Long for now until Member 3 creates the Assessment entity.
    @Column(name = "assessment_id", nullable = false)
    private Long assessmentId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String prompt;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String response;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    // Default constructor required by JPA
    public AIInteraction() {
    }

    // Parameterized constructor
    public AIInteraction(Long userId, Long assessmentId, String prompt, String response, LocalDateTime timestamp) {
        this.userId = userId;
        this.assessmentId = assessmentId;
        this.prompt = prompt;
        this.response = response;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public Long getInteractionId() { return interactionId; }
    public void setInteractionId(Long interactionId) { this.interactionId = interactionId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
