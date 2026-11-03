package com.devmate.Controller;

import com.devmate.Entities.Lesson;
import com.devmate.Services.LessonServices;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@CrossOrigin(origins = "*")
public class LessonController {

    private final LessonServices lessonServices;

    public LessonController(
            LessonServices lessonServices
    ) {
        this.lessonServices = lessonServices;
    }

    // =====================================================
    // CREATE
    // POST /api/lessons/course/{courseID}
    // =====================================================

    @PostMapping("/course/{courseID}")
    public ResponseEntity<Lesson> createLesson(
            @PathVariable String courseID,
            @RequestBody Lesson lesson
    ) {

        Lesson created =
                lessonServices.createLesson(
                        courseID,
                        lesson
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    // =====================================================
    // READ ALL
    // GET /api/lessons
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Lesson>>
    getAllLessons() {

        return ResponseEntity.ok(
                lessonServices.getAllLessons()
        );
    }

    // =====================================================
    // READ LESSON BY ID
    // GET /api/lessons/{lessonID}
    // =====================================================

    @GetMapping("/{lessonID}")
    public ResponseEntity<Lesson> getLessonById(
            @PathVariable String lessonID
    ) {

        return ResponseEntity.ok(
                lessonServices.getLessonById(
                        lessonID
                )
        );
    }

    // =====================================================
    // READ LESSONS FOR COURSE
    // GET /api/lessons/course/{courseID}
    // =====================================================

    @GetMapping("/course/{courseID}")
    public ResponseEntity<List<Lesson>>
    getLessonsByCourse(
            @PathVariable String courseID
    ) {

        return ResponseEntity.ok(
                lessonServices.getLessonsByCourse(
                        courseID
                )
        );
    }

    // =====================================================
    // UPDATE
    // PUT /api/lessons/{lessonID}
    // =====================================================

    @PutMapping("/{lessonID}")
    public ResponseEntity<Lesson> updateLesson(
            @PathVariable String lessonID,
            @RequestBody Lesson lesson
    ) {

        return ResponseEntity.ok(
                lessonServices.updateLesson(
                        lessonID,
                        lesson
                )
        );
    }

    // =====================================================
    // DELETE
    // DELETE /api/lessons/{lessonID}
    // =====================================================

    @DeleteMapping("/{lessonID}")
    public ResponseEntity<Void> deleteLesson(
            @PathVariable String lessonID
    ) {

        lessonServices.deleteLesson(lessonID);

        return ResponseEntity
                .noContent()
                .build();
    }
}