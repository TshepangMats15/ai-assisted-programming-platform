
package com.devmate.Controller;

import com.devmate.Services.AnalyticsServices;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsServices analyticsService;

    public AnalyticsController(
            AnalyticsServices analyticsService) {
        this.analyticsService = analyticsService;
    }

    // GET /api/analytics/summary
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {

        return ResponseEntity.ok(
                analyticsService.getSummary());
    }

    // GET /api/analytics/user/USER001
    @GetMapping("/user/{userID}")
    public ResponseEntity<Map<String, Object>> getUserAnalytics(
            @PathVariable String userID) {

        return ResponseEntity.ok(
                analyticsService.getUserAnalytics(userID));
    }

    // GET /api/analytics/assessments
    @GetMapping("/assessments")
    public ResponseEntity<List<Map<String, Object>>>
    getAssessmentAnalytics() {

        return ResponseEntity.ok(
                analyticsService.getAssessmentAnalytics());
    }

    // GET /api/analytics/ai-usage
    @GetMapping("/ai-usage")
    public ResponseEntity<List<Map<String, Object>>>
    getAIUsageAnalytics() {

        return ResponseEntity.ok(
                analyticsService.getAIUsageAnalytics());
    }

    // GET /api/analytics/ai-usage/daily
    @GetMapping("/ai-usage/daily")
    public ResponseEntity<Map<String, Object>>
    getDailyAIUsage() {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("dailyAIInteractions",
                analyticsService.getDailyAIUsageFrequency());

        return ResponseEntity.ok(response);
    }

    // GET /api/analytics/ai-usage/user/USER001/daily
    @GetMapping("/ai-usage/user/{userID}/daily")
    public ResponseEntity<Map<String, Object>>
    getUserDailyAIUsage(
            @PathVariable String userID) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("userID", userID);
        response.put("dailyAIInteractions",
                analyticsService
                        .getUserDailyAIUsageFrequency(userID));

        return ResponseEntity.ok(response);
    }

    // GET /api/analytics/ai-usage/user/USER001/frequency
    @GetMapping("/ai-usage/user/{userID}/frequency")
    public ResponseEntity<Map<String, Object>>
    getUserAIUsageFrequency(
            @PathVariable String userID) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("userID", userID);
        response.put("totalAIInteractions",
                analyticsService
                        .getUserAIUsageFrequency(userID));

        return ResponseEntity.ok(response);
    }

    // GET /api/analytics/completion-time
    @GetMapping("/completion-time")
    public ResponseEntity<List<Map<String, Object>>>
    getCompletionTimeMetrics() {

        return ResponseEntity.ok(
                analyticsService.getCompletionTimeMetrics());
    }

}

