
package com.devmate.Repository;

import com.devmate.Entities.QuestionTestCase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionTestCaseRepository
        extends JpaRepository<QuestionTestCase, Long> {

    List<QuestionTestCase> findByQuestionQuestionID(
        String questionID
    );
}
