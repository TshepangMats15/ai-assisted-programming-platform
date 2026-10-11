package com.devmate.Services;


import com.devmate.Entities.Assessment;
import com.devmate.Repository.AssessmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssessmentServices {
    private final AssessmentRepository assessmentRepository;

    public AssessmentServices(
            AssessmentRepository assessmentRepository) {

        this.assessmentRepository = assessmentRepository;
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
    // UPDATE
    public Assessment updateAssessment(
            Integer assessmentID,
            Assessment updatedAssessment) {

        Assessment existingAssessment =
                assessmentRepository.findById(assessmentID)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assessment not found with ID: "
                                                + assessmentID
                                ));

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
