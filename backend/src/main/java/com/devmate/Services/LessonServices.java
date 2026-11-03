package com.devmate.Services;

import com.devmate.Entities.Coursework;
import com.devmate.Entities.Lesson;
import com.devmate.Repository.CourseworkRepository;
import com.devmate.Repository.LessonRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LessonServices {

    private final LessonRepository lessonRepository;
    private final CourseworkRepository courseworkRepository;

    public LessonServices(
            LessonRepository lessonRepository,
            CourseworkRepository courseworkRepository
    ) {
        this.lessonRepository = lessonRepository;
        this.courseworkRepository = courseworkRepository;
    }

    // =====================================================
    // CREATE LESSON
    // =====================================================

    public Lesson createLesson(
            String courseID,
            Lesson lesson
    ) {
        Coursework coursework = courseworkRepository
                .findById(courseID)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Coursework not found with ID: " + courseID
                        )
                );

        lesson.setCoursework(coursework);

        return lessonRepository.save(lesson);
    }

    // =====================================================
    // GET ALL LESSONS
    // =====================================================

    public List<Lesson> getAllLessons() {
        return lessonRepository.findAll();
    }

    // =====================================================
    // GET LESSON BY ID
    // =====================================================

    public Lesson getLessonById(String lessonID) {
        return lessonRepository
                .findById(lessonID)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Lesson not found with ID: " + lessonID
                        )
                );
    }

    // =====================================================
    // GET LESSONS FOR COURSE
    // =====================================================

    public List<Lesson> getLessonsByCourse(
            String courseID
    ) {
        if (!courseworkRepository.existsById(courseID)) {
            throw new RuntimeException(
                    "Coursework not found with ID: " + courseID
            );
        }

        return lessonRepository
                .findByCourseworkCourseID(courseID);
    }

    // =====================================================
    // UPDATE LESSON
    // =====================================================

    public Lesson updateLesson(
            String lessonID,
            Lesson updatedLesson
    ) {
        Lesson existingLesson = getLessonById(lessonID);

        existingLesson.setTitle(
                updatedLesson.getTitle()
        );

        existingLesson.setContentType(
                updatedLesson.getContentType()
        );

        existingLesson.setContentBody(
                updatedLesson.getContentBody()
        );

        return lessonRepository.save(existingLesson);
    }

    // =====================================================
    // DELETE LESSON
    // =====================================================

    public void deleteLesson(String lessonID) {

        if (!lessonRepository.existsById(lessonID)) {
            throw new RuntimeException(
                    "Lesson not found with ID: " + lessonID
            );
        }

        lessonRepository.deleteById(lessonID);
    }
}

