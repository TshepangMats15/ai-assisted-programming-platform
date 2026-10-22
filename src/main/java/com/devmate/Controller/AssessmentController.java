package com.devmate.Controller;

import com.devmate.Entities.Assessment;
import com.devmate.Services.AssessmentServices;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {
    private final AssessmentServices assessmentServices;

    public AssessmentController(
            AssessmentServices assessmentServices){
        this.assessmentServices = assessmentServices;
    }
    //Create
    @PostMapping
    public ResponseEntity<Assessment> createAssessment(
            @RequestBody Assessment assessment){
        Assessment created =
                assessmentServices.createAssessment(assessment);

        return  ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }
    // READ ALL
    @GetMapping
    public ResponseEntity<List<Assessment>> getAllAssessments() {

        return ResponseEntity.ok(
                assessmentServices.getAllAssessments()
        );
    }
    // READ ONE
    @GetMapping("/{assessmentID}")
    public ResponseEntity<Assessment> getAssessmentById(
            @PathVariable Integer assessmentID) {

        return ResponseEntity.ok(
                assessmentServices.getAssessmentById(assessmentID)
        );
    }
    // UPDATE
    @PutMapping("/{assessmentID}")
    public ResponseEntity<Assessment> updateAssessment(
            @PathVariable Integer assessmentID,
            @RequestBody Assessment assessment) {

        return ResponseEntity.ok(
                assessmentServices.updateAssessment(
                        assessmentID,
                        assessment
                )
        );
    }
    // DELETE
    @DeleteMapping("/{assessmentID}")
    public ResponseEntity<Void> deleteAssessment(
            @PathVariable Integer assessmentID) {

        assessmentServices.deleteAssessment(assessmentID);

        return ResponseEntity.noContent().build();
    }

}
