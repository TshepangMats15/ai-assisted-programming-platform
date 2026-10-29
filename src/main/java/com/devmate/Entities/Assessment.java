package com.devmate.Entities;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "assessment")
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assessmentid")
    private Integer assessmentID;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "difficulty")
    private String difficulty;

    @Column(name = "program_lang")
    private String programLang;

    @Column(name = "time_limit")
    private Integer timeLimit;

    @Column(name = "assessment_type", nullable = false)
    private String assessmentType; // PRE_TEST or POST_TEST

    @Column(name = "ai_allowed", nullable = false)
    private Boolean aiAllowed = false; // Controls AI gating

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Question> questions;

    public Assessment() {
    }

    public Assessment(String title, String description, String difficulty, 
                      String programLang, Integer timeLimit, 
                      String assessmentType, Boolean aiAllowed) {
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.programLang = programLang;
        this.timeLimit = timeLimit;
        this.assessmentType = assessmentType;
        this.aiAllowed = aiAllowed;
    }

    // Getters and Setters
    public Integer getAssessmentID() {
        return assessmentID;
    }

    public void setAssessmentID(Integer assessmentID) {
        this.assessmentID = assessmentID;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getProgramLang() {
        return programLang;
    }

    public void setProgramLang(String programLang) {
        this.programLang = programLang;
    }

    public Integer getTimeLimit() {
        return timeLimit;
    }

    public void setTimeLimit(Integer timeLimit) {
        this.timeLimit = timeLimit;
    }

    public String getAssessmentType() {
        return assessmentType;
    }

    public void setAssessmentType(String assessmentType) {
        this.assessmentType = assessmentType;
    }

    public Boolean getAiAllowed() {
        return aiAllowed;
    }

    public void setAiAllowed(Boolean aiAllowed) {
        this.aiAllowed = aiAllowed;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }
}