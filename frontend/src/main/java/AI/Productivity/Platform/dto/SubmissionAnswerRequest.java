package AI.Productivity.Platform.dto;

import java.util.Map;

public record SubmissionAnswerRequest(
        Map<String, String> mcqAnswers
) {
}