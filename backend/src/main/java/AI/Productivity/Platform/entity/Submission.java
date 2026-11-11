package AI.Productivity.Platform.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.devmate.Entities.Users;
import com.devmate.Entities.Assessment;

@Entity
@Table(name = "submission")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "submissionID")
    private Long submissionId;

    @ManyToOne
    @JoinColumn(name = "userID", nullable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "assessmentID", nullable = false)
    private Assessment assessment;

    @Column(name = "sourceCode", columnDefinition = "TEXT")
    private String sourceCode;

    @Column(name = "SubmissionTime")
    private LocalDateTime submissionTime;

    @Column(name = "score", precision = 10, scale = 2)
    private BigDecimal score;

    // Constructors
    public Submission() {
    }

    public Submission(Users user, Assessment assessment, String sourceCode, LocalDateTime submissionTime, BigDecimal score) {
        this.user = user;
        this.assessment = assessment;
        this.sourceCode = sourceCode;
        this.submissionTime = submissionTime;
        this.score = score;
    }

    // Getters and Setters
    public Long getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public Assessment getAssessment() {
        return assessment;
    }

    public void setAssessment(Assessment assessment) {
        this.assessment = assessment;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public LocalDateTime getSubmissionTime() {
        return submissionTime;
    }

    public void setSubmissionTime(LocalDateTime submissionTime) {
        this.submissionTime = submissionTime;
    }

    public BigDecimal getScore() {
        return score;
    }

    public void setScore(BigDecimal score) {
        this.score = score;
    }
}