package com.devmate.Controller;

public class AIRequests {

    private String prompt;

    public AIRequests() {
    }

    public AIRequests(String prompt) {
        this.prompt = prompt;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }
}