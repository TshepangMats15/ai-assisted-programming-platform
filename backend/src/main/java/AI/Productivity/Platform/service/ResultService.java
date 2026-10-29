package AI.Productivity.Platform.service;

import AI.Productivity.Platform.dto.ResultRequest;
import AI.Productivity.Platform.dto.ResultResponse;
import AI.Productivity.Platform.entity.Result;
import AI.Productivity.Platform.repository.ResultRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ResultService {

    private final ResultRepository resultRepository;

    public ResultService(ResultRepository resultRepository) {
        this.resultRepository = resultRepository;
    }

    public ResultResponse saveResult(ResultRequest request) {
        LocalDateTime now = LocalDateTime.now();

        // Creating the result using the exact flat fields from the updated Result entity
        Result result = new Result(
                request.userId(),
                request.assessmentId(),
                request.score(),
                request.completionTime(),
                request.aiUsage(),
                now
        );

        Result savedResult = resultRepository.save(result);
        return new ResultResponse(savedResult.getResultId(), "Result successfully saved.", now);
    }
}