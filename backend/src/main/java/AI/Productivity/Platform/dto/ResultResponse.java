package AI.Productivity.Platform.dto;

import java.time.LocalDateTime;

public record ResultResponse(Long resultId, String message, LocalDateTime createdAt) {
}