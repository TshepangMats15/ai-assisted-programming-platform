
package AI.Productivity.Platform.repository;

import AI.Productivity.Platform.entity.Submission;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SubmissionRepository
        extends JpaRepository<Submission, Long> {

    @Query("""
        SELECT s
        FROM Submission s
        WHERE s.user.firebaseUid = :firebaseUid
        ORDER BY s.submissionId DESC
        """)
    List<Submission> findByFirebaseUid(
            @Param("firebaseUid") String firebaseUid
    );
}
