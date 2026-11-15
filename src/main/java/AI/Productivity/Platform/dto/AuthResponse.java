package AI.Productivity.Platform.dto;

public record AuthResponse(
        String uid,
        String role,
        String message
) {
}