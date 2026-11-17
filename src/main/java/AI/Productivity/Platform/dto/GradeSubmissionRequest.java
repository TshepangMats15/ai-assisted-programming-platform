
package AI.Productivity.Platform.dto;

import java.util.Map;

public record GradeSubmissionRequest(
        Map<String, String> mcqAnswers
) {
}
