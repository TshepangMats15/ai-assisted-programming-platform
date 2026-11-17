
package com.devmate.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "question_test_cases")
public class QuestionTestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_case_id")
    private Long testCaseId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "input_data", columnDefinition = "TEXT")
    private String inputData;

    @Column(
        name = "expected_output",
        columnDefinition = "TEXT",
        nullable = false
    )
    private String expectedOutput;

    public QuestionTestCase() {
    }

    public QuestionTestCase(
        Question question,
        String inputData,
        String expectedOutput
    ) {
        this.question = question;
        this.inputData = inputData;
        this.expectedOutput = expectedOutput;
    }

    public Long getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(Long testCaseId) {
        this.testCaseId = testCaseId;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public String getInputData() {
        return inputData;
    }

    public void setInputData(String inputData) {
        this.inputData = inputData;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }
}

