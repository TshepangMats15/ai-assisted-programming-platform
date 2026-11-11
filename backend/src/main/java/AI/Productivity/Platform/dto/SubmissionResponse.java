package AI.Productivity.Platform.dto;

import java.time.LocalDateTime;

public record SubmissionResponse(Long submissionId, String message, LocalDateTime submittedAt) {
}