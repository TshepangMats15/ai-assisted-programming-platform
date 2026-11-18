package AI.Productivity.Platform.repository;

import AI.Productivity.Platform.entity.Result;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResultRepository
        extends JpaRepository<Result, Long> {

    List<Result> findByUserId(String userId);

    List<Result> findByAssessmentId(Integer assessmentId);

    boolean existsByUserIdAndAssessmentId(
            String userId,
            Integer assessmentId
    );

    Optional<Result> findBySubmissionId(
            Long submissionId
    );

    boolean existsBySubmissionId(
            Long submissionId
    );
}