package AI.Productivity.Platform.service;

import AI.Productivity.Platform.dto.SubmissionRequest;
import AI.Productivity.Platform.dto.SubmissionResponse;
import AI.Productivity.Platform.entity.Submission;
import AI.Productivity.Platform.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class SubmissionService {

    private final SubmissionRepository repository;

    public SubmissionService(SubmissionRepository repository) {
        this.repository = repository;
    }

    public SubmissionResponse processSubmission(Long userId, SubmissionRequest request) {
        LocalDateTime now = LocalDateTime.now();
        Submission submission = new Submission(
                userId,
                request.assessmentId(),
                request.sourceCode(),
                now,
                request.attemptNumber()
        );
        Submission savedSubmission = repository.save(submission);
        return new SubmissionResponse(savedSubmission.getSubmissionId(), "Code successfully submitted.", now);
    }
}
