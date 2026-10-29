package com.devmate.Services;

import com.devmate.Entities.Assessment;
import com.devmate.Entities.Question;
import com.devmate.Repository.AssessmentRepository;
import com.devmate.Repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssessmentServices {
    private final AssessmentRepository assessmentRepository;
    private final QuestionRepository questionRepository;

    public AssessmentServices(
            AssessmentRepository assessmentRepository,
            QuestionRepository questionRepository) {

        this.assessmentRepository = assessmentRepository;
        this.questionRepository = questionRepository;
    }

    // CREATE
    public Assessment createAssessment(Assessment assessment) {
        return assessmentRepository.save(assessment);
    }

    // READ ALL
    public List<Assessment> getAllAssessments() {
        return assessmentRepository.findAll();
    }

    // READ ONE
    public Assessment getAssessmentById(Integer assessmentID) {

        return assessmentRepository.findById(assessmentID)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Assessment not found with ID: "
                                        + assessmentID
                        ));
    }

    // READ QUESTIONS FOR ASSESSMENT
    public List<Question> getQuestionsByAssessmentId(Integer assessmentID) {
        getAssessmentById(assessmentID); // Validates existence
        return questionRepository.findByAssessmentAssessmentID(assessmentID);
    }

    // UPDATE
    public Assessment updateAssessment(
            Integer assessmentID,
            Assessment updatedAssessment) {

        Assessment existingAssessment = getAssessmentById(assessmentID);

        existingAssessment.setTitle(
                updatedAssessment.getTitle()
        );
        existingAssessment.setDescription(
                updatedAssessment.getDescription()
        );
        existingAssessment.setDifficulty(
                updatedAssessment.getDifficulty()
        );
        existingAssessment.setProgramLang(
                updatedAssessment.getProgramLang()
        );
        existingAssessment.setTimeLimit(
                updatedAssessment.getTimeLimit()
        );
        existingAssessment.setAssessmentType(
                updatedAssessment.getAssessmentType()
        );
        existingAssessment.setAiAllowed(
                updatedAssessment.getAiAllowed()
        );

        return assessmentRepository.save(existingAssessment);
    }

    // DELETE
    public void deleteAssessment(Integer assessmentID) {

        if (!assessmentRepository.existsById(assessmentID)) {
            throw new RuntimeException(
                    "Assessment not found with ID: "
                            + assessmentID
            );
        }
        assessmentRepository.deleteById(assessmentID);
    }
}
