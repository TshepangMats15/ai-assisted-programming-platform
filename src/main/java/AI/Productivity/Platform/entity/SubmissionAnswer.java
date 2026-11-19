
package AI.Productivity.Platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "submission_answers",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_submission_question",
            columnNames = {
                "submissionid",
                "question_id"
            }
        )
    }
)
public class SubmissionAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    private Long answerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submissionid", nullable = false)
    private Submission submission;

    @Column(name = "question_id", nullable = false)
    private String questionId;

    @Column(
        name = "selected_answer",
        nullable = false,
        columnDefinition = "TEXT"
    )
    private String selectedAnswer;

    @Column(name = "answered_at", nullable = false)
    private LocalDateTime answeredAt;

    public SubmissionAnswer() {
    }

    public SubmissionAnswer(
        Submission submission,
        String questionId,
        String selectedAnswer
    ) {
        this.submission = submission;
        this.questionId = questionId;
        this.selectedAnswer = selectedAnswer;
        this.answeredAt = LocalDateTime.now();
    }

    public Long getAnswerId() {
        return answerId;
    }

    public Submission getSubmission() {
        return submission;
    }

    public String getQuestionId() {
        return questionId;
    }

    public String getSelectedAnswer() {
        return selectedAnswer;
    }

    public void setSelectedAnswer(String selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
        this.answeredAt = LocalDateTime.now();
    }

    public LocalDateTime getAnsweredAt() {
        return answeredAt;
    }
}
