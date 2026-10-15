package AI.Productivity.Platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "results")
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;

    @Column(name = "submission_id", nullable = false)
    private Long submissionId;

    @Column(name = "score", nullable = false)
    private Double score;

    @Column(name = "ai_feedback", columnDefinition = "TEXT")
    private String aiFeedback;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Result() {}

    public Result(Long submissionId, Double score, String aiFeedback, LocalDateTime createdAt) {
        this.submissionId = submissionId;
        this.score = score;
        this.aiFeedback = aiFeedback;
        this.createdAt = createdAt;
    }

    public Long getResultId() { return resultId; }
    public void setResultId(Long resultId) { this.resultId = resultId; }
    public Long getSubmissionId() { return submissionId; }
    public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    public String getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
