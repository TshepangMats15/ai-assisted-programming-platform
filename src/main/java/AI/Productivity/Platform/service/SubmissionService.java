package AI.Productivity.Platform.service;

import AI.Productivity.Platform.dto.SubmissionRequest;
import AI.Productivity.Platform.dto.SubmissionResponse;
import AI.Productivity.Platform.entity.Submission;
import AI.Productivity.Platform.repository.SubmissionRepository;

// Member 3's Entities
import com.devmate.Entities.Users;
import com.devmate.Entities.Assessment;

// Member 3's Repositories
import com.devmate.Repository.UserRepository;
import com.devmate.Repository.AssessmentRepository;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final AssessmentRepository assessmentRepository;

    public SubmissionService(SubmissionRepository submissionRepository,
                             UserRepository userRepository,
                             AssessmentRepository assessmentRepository) {
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.assessmentRepository = assessmentRepository;
    }

    public SubmissionResponse processSubmission(String userId, SubmissionRequest request) {

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found in database."));

        Assessment assessment = assessmentRepository.findById(request.assessmentId().intValue())
                .orElseThrow(() -> new RuntimeException("Assessment not found in database."));

        LocalDateTime now = LocalDateTime.now();

        // 5-parameter constructor matching Submission.java (user, assessment, sourceCode, submissionTime, score)
        Submission submission = new Submission(
                user,
                assessment,
                request.sourceCode(),
                now,
                null // ungraded score
        );

        Submission savedSubmission = submissionRepository.save(submission);
        return new SubmissionResponse(savedSubmission.getSubmissionId(), "Code successfully submitted.", now);
    }
}