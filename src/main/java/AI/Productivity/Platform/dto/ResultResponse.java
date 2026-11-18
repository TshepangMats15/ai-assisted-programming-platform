package AI.Productivity.Platform.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ResultResponse(
        Long resultId,
        Long submissionId,
        BigDecimal score,
        String status,
        String message,
        LocalDateTime createdAt
) {

    // KEEP EXISTING GRADING CODE COMPATIBLE
    public ResultResponse(
            Long resultId,
            String message,
            LocalDateTime createdAt
    ) {
        this(
                resultId,
                null,
                null,
                null,
                message,
                createdAt
        );
    }
}