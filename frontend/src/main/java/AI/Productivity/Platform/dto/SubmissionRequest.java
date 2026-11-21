
package AI.Productivity.Platform.dto;

import java.math.BigDecimal;
import java.util.Map;

public record SubmissionRequest(
        String userId,
        Integer assessmentId,
        String sourceCode,
        BigDecimal score,
        Integer completionTime,
        Integer aiUsage,
        Map<String, String> mcqAnswers
) {
}

