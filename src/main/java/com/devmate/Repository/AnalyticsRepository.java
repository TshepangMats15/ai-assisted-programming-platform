package com.devmate.Repository;

import com.devmate.Entities.Analytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnalyticsRepository extends JpaRepository<Analytics, Integer> {

    Optional<Analytics> findByUserId(String userId);
}
