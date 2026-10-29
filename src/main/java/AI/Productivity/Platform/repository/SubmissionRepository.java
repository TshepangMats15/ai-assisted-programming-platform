package AI.Productivity.Platform.repository;

import AI.Productivity.Platform.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByUserId(String userId);
}