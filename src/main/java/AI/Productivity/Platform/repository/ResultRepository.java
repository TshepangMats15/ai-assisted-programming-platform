package AI.Productivity.Platform.repository;

import AI.Productivity.Platform.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {

    // Member 3's custom queries perfectly adapted to your flattened Result entity
    List<Result> findByUserId(String userId);

    List<Result> findByAssessmentId(Integer assessmentId);
}