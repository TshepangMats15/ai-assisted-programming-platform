package AI.Productivity.Platform.service;

import AI.Productivity.Platform.dto.ResultRequest;
import AI.Productivity.Platform.dto.ResultResponse;
import AI.Productivity.Platform.entity.Result;
import AI.Productivity.Platform.repository.ResultRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ResultService {

    private final ResultRepository repository;

    public ResultService(ResultRepository repository) {
        this.repository = repository;
    }

    public ResultResponse saveResult(ResultRequest request) {
        LocalDateTime now = LocalDateTime.now();
        Result result = new Result(
                request.submissionId(),
                request.score(),
                request.aiFeedback(),
                now
        );
        Result savedResult = repository.save(result);
        return new ResultResponse(savedResult.getResultId(), "Result successfully saved.", now);
    }
}