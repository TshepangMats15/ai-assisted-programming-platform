
package AI.Productivity.Platform.repository;

import AI.Productivity.Platform.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Long> {

    // Find results belonging to a specific user
    List<Result> findByUserId(String userId);

    // Find results belonging to a specific assessment
    List<Result> findByAssessmentId(Integer assessmentId);
}
