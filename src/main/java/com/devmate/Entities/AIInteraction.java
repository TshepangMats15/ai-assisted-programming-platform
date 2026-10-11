package com.devmate.Entities;

import jakarta.persistence.*;
import org.hibernate.annotations.Audited;
import jakarta.persistence.Column;
import java.time.LocalDateTime;

@Entity
@Table(name = "aiinteraction")
public class AIInteraction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interactionID")
    private Integer interactionID;

    @Column(name = "userID", nullable = false)
    private String userID;

    @Column(name = "assessmentID", nullable = false)
    private Integer assessmentID;

    @Column(name = "prompt", columnDefinition = "TEXT")
    private String prompt;

    @Column(name = "response", columnDefinition = "TEXT")
    private String response;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "errorMessage", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "processingTimeMs")
    private Long processingTimeMs;

    public AIInteraction() {
    }

    public AIInteraction(String userID, Integer assessmentID,
                         String prompt, String response,
                         LocalDateTime timestamp) {
        this.userID = userID;
        this.assessmentID = assessmentID;
        this.prompt = prompt;
        this.response = response;
        this.timestamp = timestamp;
    }
    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public Integer getInteractionID() {
        return interactionID;
    }
    public void setInteractionID(Integer interactionID) {
        this.interactionID = interactionID;
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
    public String getPrompt() {
        return prompt;
    }
    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }
    public String getResponse() {
        return response;
    }
    public void setResponse(String response) {
        this.response = response;
    }
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Long getProcessingTimeMs() {
        return processingTimeMs;
    }

    public void setProcessingTimeMs(Long processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }
}


