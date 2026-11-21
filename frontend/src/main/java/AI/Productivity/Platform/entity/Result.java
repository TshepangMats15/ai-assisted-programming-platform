
package AI.Productivity.Platform.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "result")
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resultID")
    private Long resultId;

    @Column(name = "submissionid", unique = true)
    private Long submissionId;

    @Column(name = "userID", nullable = false)
    private String userId;

    @Column(name = "assessmentID", nullable = false)
    private Integer assessmentId;

    @Column(name = "score", precision = 10, scale = 2)
    private BigDecimal score;

    @Column(name = "completion_time")
    private Integer completionTime;

    @Column(name = "ai_usage")
    private Integer aiUsage;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    public Result() {
    }

    // EXISTING CONSTRUCTOR FOR COMPATIBILITY
    public Result(
            String userId,
            Integer assessmentId,
            BigDecimal score,
            Integer completionTime,
            Integer aiUsage,
            LocalDateTime submittedAt
    ) {
        this.userId = userId;
        this.assessmentId = assessmentId;
        this.score = score;
        this.completionTime = completionTime;
        this.aiUsage = aiUsage;
        this.submittedAt = submittedAt;
    }

    // NEW CONSTRUCTOR FOR AUTOMATIC GRADING
    public Result(
            Long submissionId,
            String userId,
            Integer assessmentId,
            BigDecimal score,
            Integer completionTime,
            Integer aiUsage,
            LocalDateTime submittedAt
    ) {
        this.submissionId = submissionId;
        this.userId = userId;
        this.assessmentId = assessmentId;
        this.score = score;
        this.completionTime = completionTime;
        this.aiUsage = aiUsage;
        this.submittedAt = submittedAt;
    }

    public Long getResultId() {
        return resultId;
    }

    public void setResultId(Long resultId) {
        this.resultId = resultId;
    }

    public Long getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Integer getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Integer assessmentId) {
        this.assessmentId = assessmentId;
    }

    public BigDecimal getScore() {
        return score;
    }

    public void setScore(BigDecimal score) {
        this.score = score;
    }

    public Integer getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(Integer completionTime) {
        this.completionTime = completionTime;
    }

    public Integer getAiUsage() {
        return aiUsage;
    }

    public void setAiUsage(Integer aiUsage) {
        this.aiUsage = aiUsage;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}
