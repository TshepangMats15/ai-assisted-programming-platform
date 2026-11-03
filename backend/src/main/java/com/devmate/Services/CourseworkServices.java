package com.devmate.Services;

import com.devmate.Entities.Assessment;
import com.devmate.Entities.Coursework;
import com.devmate.Repository.CourseworkRepository;
import AI.Productivity.Platform.repository.ResultRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CourseworkServices {
    private final CourseworkRepository courseWorkRepository;
    private final ResultRepository resultRepository;

    public CourseworkServices(CourseworkRepository courseworkRepository, 
                              ResultRepository resultRepository) {
        this.courseWorkRepository = courseworkRepository;
        this.resultRepository = resultRepository;
    }

    // CREATE
    public Coursework createCoursework(Coursework coursework) {
        return courseWorkRepository.save(coursework);
    }

    // READ ALL
    public List<Coursework> getAllCoursework() {
        return courseWorkRepository.findAll();
    }

    // READ ONE (Ungated Raw Data)
    public Coursework getCourseworkById(String courseID) {
        return courseWorkRepository.findById(courseID)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Coursework not found with ID: " + courseID
                        ));
    }

    // READ ONE WITH DIAGNOSTIC GATING
    public Coursework getGatedCourseworkById(String courseID, String userID) {
        Coursework course = getCourseworkById(courseID);
        Assessment preAssessment = course.getPreAssessment();

        // If a diagnostic test exists and the user hasn't finished it, hide lessons and post-assessment
        if (preAssessment != null && !hasUserCompletedAssessment(userID, preAssessment.getAssessmentID())) {
            course.setLessons(Collections.emptyList());
            course.setPostAssessment(null);
        }

        return course;
    }

    // CHECK USER ASSESSMENT COMPLETION
    public boolean hasUserCompletedAssessment(String userID, Integer assessmentID) {
        if (assessmentID == null) return true;
        return resultRepository.existsByUserIdAndAssessmentId(userID, assessmentID);
    }

    // UPDATE
    public Coursework updateCoursework(
            String courseID,
            Coursework updatedCoursework) {

        Coursework existingCoursework = getCourseworkById(courseID);

        existingCoursework.setTitle(updatedCoursework.getTitle());
        existingCoursework.setModule(updatedCoursework.getModule());
        existingCoursework.setDescription(updatedCoursework.getDescription());
        existingCoursework.setDueDate(updatedCoursework.getDueDate());
        existingCoursework.setCreatedBy(updatedCoursework.getCreatedBy());
        existingCoursework.setPreAssessment(updatedCoursework.getPreAssessment());
        existingCoursework.setPostAssessment(updatedCoursework.getPostAssessment());

        return courseWorkRepository.save(existingCoursework);
    }

    // DELETE
    public void deleteCoursework(String courseID) {
        if (!courseWorkRepository.existsById(courseID)) {
            throw new RuntimeException(
                    "Coursework not found with ID: " + courseID
            );
        }
        courseWorkRepository.deleteById(courseID);
    }
}