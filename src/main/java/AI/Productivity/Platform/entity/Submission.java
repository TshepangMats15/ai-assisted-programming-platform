package AI.Productivity.Platform.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.devmate.Entities.Users;
import com.devmate.Entities.Assessment;

@Entity
@Table(name = "Submission")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "submission_id")
    private Long submissionId;

    // --- MEMBER 3 INTEGRATION ---
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user; // Changed from User to Users

    @ManyToOne
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;
    // ----------------------------

    @Column(name = "source_code", columnDefinition = "TEXT", nullable = false)
    private String sourceCode;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;

    @Column(name = "score", precision = 10, scale =2)
    private BigDecimal score;

    public Submission() {}

    public Submission(Users user, Assessment assessment, String sourceCode, LocalDateTime submittedAt, Integer attemptNumber, BigDecimal score) {
        this.user = user;
        this.assessment = assessment;
        this.sourceCode = sourceCode;
        this.submittedAt = submittedAt;
        this.attemptNumber = attemptNumber;
        this.score = score;
    }

    public Long getSubmissionId() { return submissionId; }
    public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }

    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }

    public Assessment getAssessment() { return assessment; }
    public void setAssessment(Assessment assessment) { this.assessment = assessment; }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public Integer getAttemptNumber() { return attemptNumber; }
    public void setAttemptNumber(Integer attemptNumber) { this.attemptNumber = attemptNumber; }

    public BigDecimal getScore(){
        return score;}
    public void setScore(BigDecimal score) {
        this.score = score;
    }
}