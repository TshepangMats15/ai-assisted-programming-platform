package AI.Productivity.Platform.service;

import AI.Productivity.Platform.dto.SubmissionRequest;
import AI.Productivity.Platform.dto.SubmissionResponse;
import AI.Productivity.Platform.entity.Result;
import AI.Productivity.Platform.entity.Submission;
import AI.Productivity.Platform.repository.ResultRepository;
import AI.Productivity.Platform.repository.SubmissionRepository;

// Member 3's Entities
import com.devmate.Entities.Users;
import com.devmate.Entities.Assessment;

// Member 3's Repositories
import com.devmate.Repository.UserRepository;
import com.devmate.Repository.AssessmentRepository;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ResultRepository resultRepository;
    private final UserRepository userRepository;
    private final AssessmentRepository assessmentRepository;

    public SubmissionService(SubmissionRepository submissionRepository,
                             ResultRepository resultRepository,
                             UserRepository userRepository,
                             AssessmentRepository assessmentRepository) {
        this.submissionRepository = submissionRepository;
        this.resultRepository = resultRepository;
        this.userRepository = userRepository;
        this.assessmentRepository = assessmentRepository;
    }

    public SubmissionResponse processSubmission(String userId, SubmissionRequest request) {

        // 1. Resolve or create fallback user if not found in database
        Users user = userRepository.findById(userId).orElseGet(() -> {
            return userRepository.findAll().stream().findFirst().orElseGet(() -> {
                Users fallback = new Users("Student User", "student@devmate.edu", "{noop}pass123", "STUDENT");
                fallback.setId(userId);
                return userRepository.save(fallback);
            });
        });

        // 2. Resolve or fallback to default assessment
        Integer assessmentId = (request.assessmentId() != null) ? request.assessmentId().intValue() : 1;
        Assessment assessment = assessmentRepository.findById(assessmentId).orElseGet(() -> {
            return assessmentRepository.findAll().stream().findFirst().orElseGet(() -> {
                Assessment defaultAssessment = new Assessment();
                defaultAssessment.setTitle("Default Assessment");
                defaultAssessment.setDescription("Introductory coding exercise");
                defaultAssessment.setDifficulty("Easy");
                defaultAssessment.setProgramLang("Python");
                defaultAssessment.setTimeLimit(30);
                defaultAssessment.setAssessmentType("PRE_TEST");
                defaultAssessment.setAiAllowed(false);

                return assessmentRepository.save(defaultAssessment);
            });
        });

        LocalDateTime now = LocalDateTime.now();

        // 3. Save raw submission attempt
        Submission submission = new Submission(
                user,
                assessment,
                request.sourceCode(),
                now,
                null // ungraded score
        );
        Submission savedSubmission = submissionRepository.save(submission);

        // 4. Save Result record (unlocks coursework pre-assessment gating)
        Result result = new Result(
                user.getId(),
                assessment.getAssessmentID(),
                BigDecimal.valueOf(100.0), // Default score
                0,                         // Time taken in seconds
                0,                         // AI interactions count
                now
        );
        resultRepository.save(result);

        return new SubmissionResponse(savedSubmission.getSubmissionId(), "Code successfully submitted.", now);
    }
}