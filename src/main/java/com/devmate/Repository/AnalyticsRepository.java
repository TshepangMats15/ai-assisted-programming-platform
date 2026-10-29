package com.devmate.Repository;

import com.devmate.Entities.Analytics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalyticsRepository extends JpaRepository<Analytics, Integer> {

    Optional<Analytics> findByUserId(String userId);
}