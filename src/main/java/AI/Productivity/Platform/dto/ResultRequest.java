package AI.Productivity.Platform.dto;

import java.math.BigDecimal;

public record ResultRequest(
        String userId,
        Integer assessmentId,
        BigDecimal score,
        Integer completionTime,
        Integer aiUsage
) {}