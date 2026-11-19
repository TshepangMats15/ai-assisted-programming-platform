package AI.Productivity.Platform.repository;

import AI.Productivity.Platform.entity.Submission;
import AI.Productivity.Platform.entity.SubmissionStatus;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

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

    @Query("""
        SELECT s
        FROM Submission s
        WHERE s.user.firebaseUid = :firebaseUid
        AND s.assessment.assessmentID = :assessmentId
        AND s.status = :status
        ORDER BY s.submissionId DESC
        """)
    List<Submission> findDrafts(
        @Param("firebaseUid") String firebaseUid,
        @Param("assessmentId") Integer assessmentId,
        @Param("status") SubmissionStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT s
        FROM Submission s
        WHERE s.submissionId = :submissionId
        """)
    Optional<Submission> findByIdForUpdate(
        @Param("submissionId") Long submissionId
    );
}