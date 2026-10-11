package com.devmate.Entities;

import jakarta.persistence.*;
import org.hibernate.annotations.Audited;


@Entity
@Audited.Table(name = "Assessment")
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assessmentID")
    private Integer assessmentID;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "difficulty")
    private String difficulty;

    @Column(name = "programLang")
    private String programLang;

    @Column(name = "timeLimit")
    private Integer timeLimit;

    public Assessment() {
    }

    public Assessment(String title, String description,
                      String difficulty, String programLang,
                      Integer timeLimit) {
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.programLang = programLang;
        this.timeLimit = timeLimit;
    }


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
}



