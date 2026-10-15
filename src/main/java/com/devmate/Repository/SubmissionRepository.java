package com.devmate.Repository;

import com.devmate.Entities.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission,Integer> {
}
