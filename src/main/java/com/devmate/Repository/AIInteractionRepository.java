package com.devmate.Repository;

import com.devmate.Entities.AIInteraction;
import org.springframework.data.jpa.repository.JpaRepository;


import java.time.LocalDateTime;
import java.util.List;

public interface AIInteractionRepository extends JpaRepository <AIInteraction,Integer> {

    List<AIInteraction> findByUserID(String userID);

    List<AIInteraction> findByAssessmentID(Integer assessmentID);

    long countByUserID(String userID);

    long countByStatus(String status);

    long countByTimestampBetween(
            LocalDateTime start,
            LocalDateTime end);

    long countByUserIDAndTimestampBetween(
            String userID,
            LocalDateTime start,
            LocalDateTime end);
}
