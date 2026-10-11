package com.devmate.Entities;

import jakarta.persistence.*;
import org.hibernate.annotations.Audited;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Audited.Table(name = "Submission")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "submissionID")
    private Integer submissionID;

    @Column(name = "userID", nullable = false)
    private String userID;

    @Column(name = "assessmentID", nullable = false)
    private Integer assessmentID;

    @Column(name = "sourceCode", columnDefinition = "TEXT")
    private String sourceCode;

    @Column(name = "SubmissionTime")
    private LocalDateTime submissionTime;

    @Column(name = "score", precision = 10, scale = 2)
    private BigDecimal score;

    public Submission() {
    }
    public Submission(String userID, Integer assessmentID,
                      String sourceCode, LocalDateTime submissionTime,
                      BigDecimal score) {
        this.userID = userID;
        this.assessmentID = assessmentID;
        this.sourceCode = sourceCode;
        this.submissionTime = submissionTime;
        this.score = score;
    }
    public Integer getSubmissionID() {
        return submissionID;
    }
    public void setSubmissionID(Integer submissionID) {
        this.submissionID = submissionID;
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


