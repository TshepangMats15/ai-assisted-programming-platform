package AI.Productivity.Platform.repository;

import AI.Productivity.Platform.entity.SubmissionAnswer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubmissionAnswerRepository
        extends JpaRepository<SubmissionAnswer, Long> {

    List<SubmissionAnswer> findBySubmissionSubmissionId(
        Long submissionId
    );

    Optional<SubmissionAnswer>
        findBySubmissionSubmissionIdAndQuestionId(
            Long submissionId,
            String questionId
        );
}