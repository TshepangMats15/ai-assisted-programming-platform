package AI.Productivity.Platform.controller;

import AI.Productivity.Platform.dto.ResultRequest;
import AI.Productivity.Platform.dto.ResultResponse;
import AI.Productivity.Platform.entity.Result;
import AI.Productivity.Platform.repository.ResultRepository;
import AI.Productivity.Platform.service.ResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultService resultService;
    private final ResultRepository resultRepository;

    public ResultController(ResultService resultService, ResultRepository resultRepository) {
        this.resultService = resultService;
        this.resultRepository = resultRepository;
    }

    @PostMapping
    public ResponseEntity<ResultResponse> createResult(@RequestBody ResultRequest request) {
        return ResponseEntity.ok(resultService.saveResult(request));
    }

    @GetMapping
    public ResponseEntity<List<Result>> getAllResults() {
        return ResponseEntity.ok(resultRepository.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Result>> getResultsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(resultRepository.findByUserId(userId));
    }

    @GetMapping("/assessment/{assessmentId}")
    public ResponseEntity<List<Result>> getResultsByAssessment(@PathVariable Integer assessmentId) {
        return ResponseEntity.ok(resultRepository.findByAssessmentId(assessmentId));
    }
}