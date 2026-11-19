
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
    @Column(name = "submissionid")
    private Long submissionId;

    @ManyToOne
    @JoinColumn(
        name = "userid",
        referencedColumnName = "userid",
        nullable = false
    )
    private Users user;

    @ManyToOne
    @JoinColumn(
        name = "assessmentid",
        nullable = false
    )
    private Assessment assessment;

    @Column(name = "source_code", columnDefinition = "TEXT")
    private String sourceCode;

    @Column(name = "submission_time")
    private LocalDateTime submissionTime;

    @Column(name = "score", precision = 10, scale = 2)
    private BigDecimal score;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private SubmissionStatus status;

    @Column(name = "saved_at")
    private LocalDateTime savedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;

    public Submission() {
    }

    public Submission(
        Users user,
        Assessment assessment,
        String sourceCode,
        LocalDateTime submissionTime,
        BigDecimal score
    ) {
        this.user = user;
        this.assessment = assessment;
        this.sourceCode = sourceCode;
        this.submissionTime = submissionTime;
        this.score = score;
        this.status = SubmissionStatus.DRAFT;
        this.savedAt = LocalDateTime.now();
    }

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

    public SubmissionStatus getStatus() {
        return status;
    }

    public void setStatus(SubmissionStatus status) {
        this.status = status;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }

    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getGradedAt() {
        return gradedAt;
    }

    public void setGradedAt(LocalDateTime gradedAt) {
        this.gradedAt = gradedAt;
    }
}
