package AI.Productivity.Platform.dto;


public record SubmissionRequest(Long assessmentId, String sourceCode, Integer attemptNumber) {
}
