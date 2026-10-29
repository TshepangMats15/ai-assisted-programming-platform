package com.devmate.Controller;

public class AIRequests {

    private String prompt;
    private Integer assessmentId;
    private String userId;

    public AIRequests() {
    }

    public AIRequests(String prompt) {
        this.prompt = prompt;
    }

    public AIRequests(String prompt, Integer assessmentId, String userId) {
        this.prompt = prompt;
        this.assessmentId = assessmentId;
        this.userId = userId;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public Integer getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Integer assessmentId) {
        this.assessmentId = assessmentId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}