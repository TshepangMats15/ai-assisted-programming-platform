package com.devmate.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.Audited;

@Entity
@Table(name = "questions")
@Audited
public class Question {

    @Id
    @Column(name = "question_id", length = 255, nullable = false)
    private String questionID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessmentid", nullable = false)
    @JsonIgnore
    private Assessment assessment;

    @Column(name = "question_type", nullable = false)
    private String questionType; // "MULTIPLE_CHOICE" or "CODING_CHALLENGE"

    @Column(name = "prompt", columnDefinition = "TEXT", nullable = false)
    private String prompt;

    @Column(name = "options_json", columnDefinition = "JSON")
    private String optionsJson;

    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(name = "starter_code", columnDefinition = "TEXT")
    private String starterCode;

    public Question() {
    }

    public Question(String questionID, Assessment assessment, String questionType, 
                    String prompt, String optionsJson, String correctAnswer, String starterCode) {
        this.questionID = questionID;
        this.assessment = assessment;
        this.questionType = questionType;
        this.prompt = prompt;
        this.optionsJson = optionsJson;
        this.correctAnswer = correctAnswer;
        this.starterCode = starterCode;
    }

    public String getQuestionID() {
        return questionID;
    }

    public void setQuestionID(String questionID) {
        this.questionID = questionID;
    }

    public Assessment getAssessment() {
        return assessment;
    }

    public void setAssessment(Assessment assessment) {
        this.assessment = assessment;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getOptionsJson() {
        return optionsJson;
    }

    public void setOptionsJson(String optionsJson) {
        this.optionsJson = optionsJson;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getStarterCode() {
        return starterCode;
    }

    public void setStarterCode(String starterCode) {
        this.starterCode = starterCode;
    }
}
