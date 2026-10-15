package com.devmate.Repository;

import com.devmate.Entities.Result;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResultRepository extends JpaRepository <Result, Integer> {
    List<Result> findByUserID(String userID);

    List<Result> findByAssessmentID(Integer assessmentID);

}
