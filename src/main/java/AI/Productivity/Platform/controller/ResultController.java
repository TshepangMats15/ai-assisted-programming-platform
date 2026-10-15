package AI.Productivity.Platform.controller;

import AI.Productivity.Platform.dto.ResultRequest;
import AI.Productivity.Platform.dto.ResultResponse;
import AI.Productivity.Platform.service.ResultService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @PostMapping
    public ResultResponse createResult(@RequestBody ResultRequest request) {
        return resultService.saveResult(request);
    }
}