package AI.Productivity.Platform.dto;

import java.math.BigDecimal;

public record SubmissionRequest(
        String userId,
        Integer assessmentId,
        String sourceCode,
        BigDecimal score,
        Integer completionTime, // seconds
        Integer aiUsage         // total AI interactions during assessment
) {
}
