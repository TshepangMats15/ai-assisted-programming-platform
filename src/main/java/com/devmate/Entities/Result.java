package com.devmate.Entities;

import jakarta.persistence.*;
import org.hibernate.annotations.Audited;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Audited.Table(name = "result")
public class Result {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resultID")
    private Integer resultID;

    @Column(name = "userID", nullable = false)
    private String userID;

    @Column(name = "assessmentID", nullable = false)
    private Integer assessmentID;

    @Column(name = "score", precision = 10, scale = 2)
    private BigDecimal score;

    @Column(name = "completionTime")
    private Integer completionTime;

    @Column(name = "aiUsage")
    private Integer aiUsage;

    @Column(name = "submittedAt")
    private LocalDateTime submittedAt;

    public Result() {
    }

    public Result(String userID, Integer assessmentID,
                  BigDecimal score, Integer completionTime,
                  Integer aiUsage, LocalDateTime submittedAt) {
        this.userID = userID;
        this.assessmentID = assessmentID;
        this.score = score;
        this.completionTime = completionTime;
        this.aiUsage = aiUsage;
        this.submittedAt = submittedAt;
    }

    public Integer getResultID() {
        return resultID;
    }

    public void setResultID(Integer resultID) {
        this.resultID = resultID;
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
