
package com.devmate.Services;

import com.devmate.Entities.Assessment;
import com.devmate.Entities.Coursework;
import com.devmate.Repository.CourseworkRepository;
import AI.Productivity.Platform.repository.ResultRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class CourseworkServices {

    private final CourseworkRepository courseWorkRepository;
    private final ResultRepository resultRepository;

    public CourseworkServices(
            CourseworkRepository courseworkRepository,
            ResultRepository resultRepository
    ) {
        this.courseWorkRepository = courseworkRepository;
        this.resultRepository = resultRepository;
    }

    @Transactional
    public Coursework createCoursework(Coursework coursework) {
        return courseWorkRepository.save(coursework);
    }

    @Transactional(readOnly = true)
    public List<Coursework> getAllCoursework() {
        return courseWorkRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Coursework getCourseworkById(String courseID) {
        return courseWorkRepository.findById(courseID)
                .orElseThrow(() -> new RuntimeException(
                        "Coursework not found with ID: " + courseID
                ));
    }

    @Transactional(readOnly = true)
    public Coursework getGatedCourseworkById(
            String courseID,
            String userID
    ) {
        Coursework course = getCourseworkById(courseID);

        Assessment preAssessment = course.getPreAssessment();

        boolean unlocked = preAssessment == null
                || hasUserCompletedAssessment(
                        userID,
                        preAssessment.getAssessmentID()
                );

        Coursework response = new Coursework();

        response.setCourseID(course.getCourseID());
        response.setTitle(course.getTitle());
        response.setModule(course.getModule());
        response.setDescription(course.getDescription());
        response.setDueDate(course.getDueDate());
        response.setCreatedBy(course.getCreatedBy());
        response.setPreAssessment(preAssessment);

        if (unlocked) {
            response.setPostAssessment(course.getPostAssessment());
            response.setLessons(
                    course.getLessons() == null
                            ? Collections.emptyList()
                            : new ArrayList<>(course.getLessons())
            );
        } else {
            response.setPostAssessment(null);
            response.setLessons(Collections.emptyList());
        }

        return response;
    }

    @Transactional(readOnly = true)
    public boolean hasUserCompletedAssessment(
            String userID,
            Integer assessmentID
    ) {
        if (assessmentID == null) {
            return true;
        }

        if (userID == null || userID.isBlank()) {
            return false;
        }

        return resultRepository.existsByUserIdAndAssessmentId(
                userID,
                assessmentID
        );
    }

    @Transactional
    public Coursework updateCoursework(
            String courseID,
            Coursework updatedCoursework
    ) {
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

    @Transactional
    public void deleteCoursework(String courseID) {
        if (!courseWorkRepository.existsById(courseID)) {
            throw new RuntimeException(
                    "Coursework not found with ID: " + courseID
            );
        }

        courseWorkRepository.deleteById(courseID);
    }
}
