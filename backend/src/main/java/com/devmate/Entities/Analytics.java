package com.devmate.Entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics")
public class Analytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analytics_id")
    private Integer analyticsId;

    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    @Column(name = "total_assessments")
    private Integer totalAssessments = 0;

    @Column(name = "completed_assessments")
    private Integer completedAssessments = 0;

    @Column(name = "average_score")
    private Double averageScore = 0.0;

    @Column(name = "total_ai_interactions")
    private Integer totalAiInteractions = 0;

    @Column(name = "successful_ai_interactions")
    private Integer successfulAiInteractions = 0;

    @Column(name = "failed_ai_interactions")
    private Integer failedAiInteractions = 0;

    @Column(name = "average_completion_time")
    private Double averageCompletionTime = 0.0;

    @Column(name = "average_ai_processing_time_ms")
    private Double averageAiProcessingTimeMs = 0.0;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        lastUpdated = LocalDateTime.now();
    }

    public Integer getAnalyticsId() {
        return analyticsId;
    }

    public void setAnalyticsId(Integer analyticsId) {
        this.analyticsId = analyticsId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Integer getTotalAssessments() {
        return totalAssessments;
    }

    public void setTotalAssessments(Integer totalAssessments) {
        this.totalAssessments = totalAssessments;
    }

    public Integer getCompletedAssessments() {
        return completedAssessments;
    }

    public void setCompletedAssessments(Integer completedAssessments) {
        this.completedAssessments = completedAssessments;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public Integer getTotalAiInteractions() {
        return totalAiInteractions;
    }

    public void setTotalAiInteractions(Integer totalAiInteractions) {
        this.totalAiInteractions = totalAiInteractions;
    }

    public Integer getSuccessfulAiInteractions() {
        return successfulAiInteractions;
    }

    public void setSuccessfulAiInteractions(Integer successfulAiInteractions) {
        this.successfulAiInteractions = successfulAiInteractions;
    }

    public Integer getFailedAiInteractions() {
        return failedAiInteractions;
    }

    public void setFailedAiInteractions(Integer failedAiInteractions) {
        this.failedAiInteractions = failedAiInteractions;
    }

    public Double getAverageCompletionTime() {
        return averageCompletionTime;
    }

    public void setAverageCompletionTime(Double averageCompletionTime) {
        this.averageCompletionTime = averageCompletionTime;
    }

    public Double getAverageAiProcessingTimeMs() {
        return averageAiProcessingTimeMs;
    }

    public void setAverageAiProcessingTimeMs(Double averageAiProcessingTimeMs) {
        this.averageAiProcessingTimeMs = averageAiProcessingTimeMs;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
}
