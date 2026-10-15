package com.devmate.Controller;

import com.devmate.Entities.Coursework;
import com.devmate.Services.CourseworkServices;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coursework")
public class CourseworkController {
    private final CourseworkServices courseworkServices;

    public CourseworkController(CourseworkServices courseworkServices) {
        this.courseworkServices = courseworkServices;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Coursework> createCoursework(
            @RequestBody Coursework coursework) {

        Coursework created =
                courseworkServices.createCoursework(coursework);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<List<Coursework>> getAllCoursework() {

        return ResponseEntity.ok(
                courseworkServices.getAllCoursework()
        );
    }

    // READ ONE
    @GetMapping("/{courseID}")
    public ResponseEntity<Coursework> getCourseworkById(
            @PathVariable String courseID) {

        return ResponseEntity.ok(
                courseworkServices.getCourseworkById(courseID)
        );
    }

    // UPDATE
    @PutMapping("/{courseID}")
    public ResponseEntity<Coursework> updateCoursework(
            @PathVariable String courseID,
            @RequestBody Coursework coursework) {

        return ResponseEntity.ok(
                courseworkServices.updateCoursework(
                        courseID,
                        coursework
                )
        );
    }

    // DELETE
    @DeleteMapping("/{courseID}")
    public ResponseEntity<Void> deleteCoursework(
            @PathVariable String courseID) {

        courseworkServices.deleteCoursework(courseID);

        return ResponseEntity.noContent().build();
    }
}

