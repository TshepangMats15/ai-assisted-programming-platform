package com.devmate.Services;


import com.devmate.Entities.Coursework;
import com.devmate.Repository.CourseworkRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseworkServices {
    private final CourseworkRepository courseWorkRepository;

    public CourseworkServices(CourseworkRepository courseworkRepository) {
        this.courseWorkRepository = courseworkRepository;
    }

    // CREATE
    public Coursework createCoursework(Coursework coursework) {
        return courseWorkRepository.save(coursework);
    }

    // READ ALL
    public List<Coursework> getAllCoursework() {
        return courseWorkRepository.findAll();
    }

    // READ ONE
    public Coursework getCourseworkById(String courseID) {
        return courseWorkRepository.findById(courseID)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Coursework not found with ID: " + courseID
                        ));
    }
    // UPDATE
    public Coursework updateCoursework(
            String courseID,
            Coursework updatedCoursework) {

        Coursework existingCoursework =
                courseWorkRepository.findById(courseID)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coursework not found with ID: "
                                                + courseID
                                ));
        existingCoursework.setTitle(
                updatedCoursework.getTitle()
        );
        existingCoursework.setModule(
                updatedCoursework.getModule()
        );
        existingCoursework.setDescription(
                updatedCoursework.getDescription()
        );
        existingCoursework.setDueDate(
                updatedCoursework.getDueDate()
        );
        existingCoursework.setCreatedBy(
                updatedCoursework.getCreatedBy()
        );
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

