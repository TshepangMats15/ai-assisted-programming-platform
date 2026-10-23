
package com.devmate.Services;

import AI.Productivity.Platform.entity.Result;
import AI.Productivity.Platform.repository.ResultRepository;

import com.devmate.Entities.AIInteraction;
import com.devmate.Entities.Analytics;
import com.devmate.Repository.AIInteractionRepository;
import com.devmate.Repository.AnalyticsRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsServices {

    private final ResultRepository resultRepository;
    private final AIInteractionRepository interactionRepository;
    private final AnalyticsRepository analyticsRepository;

    public AnalyticsServices(
            ResultRepository resultRepository,
            AIInteractionRepository interactionRepository,
            AnalyticsRepository analyticsRepository) {

        this.resultRepository = resultRepository;
        this.interactionRepository = interactionRepository;
        this.analyticsRepository = analyticsRepository;
    }

    // ==========================================
    // 1. OVERALL DASHBOARD STATISTICS
    // ==========================================

    public Map<String, Object> getSummary() {

        List<Result> results = resultRepository.findAll();

        List<AIInteraction> interactions =
                interactionRepository.findAll();

        Map<String, Object> summary = new LinkedHashMap<>();

        summary.put(
                "totalAssessmentsCompleted",
                results.size()
        );

        // Aliases for existing frontend reports
        summary.put(
                "totalAssessments",
                results.size()
        );

        summary.put(
                "totalAIInteractions",
                interactions.size()
        );

        summary.put(
                "totalAiInteractions",
                interactions.size()
        );

        summary.put(
                "averageScore",
                calculateAverageScore(results)
        );

        summary.put(
                "averageCompletionTimeSeconds",
                averageCompletionTime(results)
        );

        summary.put(
                "successfulAIInteractions",
                countByStatus(interactions, "SUCCESS")
        );

        summary.put(
                "failedAIInteractions",
                countByStatus(interactions, "FAILED")
        );

        summary.put(
                "averageAIProcessingTimeMs",
                averageAIProcessingTime(interactions)
        );

        summary.put(
                "totalRecordedAIUsage",
                results.stream()
                        .map(Result::getAiUsage)
                        .filter(Objects::nonNull)
                        .mapToInt(Integer::intValue)
                        .sum()
        );

        return summary;
    }

    // ==========================================
    // 2. INDIVIDUAL USER ANALYTICS
    // ==========================================

    public Map<String, Object> getUserAnalytics(
            String userID) {

        validateUserId(userID);

        List<Result> results =
                resultRepository.findByUserId(userID);

        List<AIInteraction> interactions =
                interactionRepository.findByUserID(userID);

        Map<String, Object> analytics =
                new LinkedHashMap<>();

        analytics.put("userID", userID);

        analytics.put(
                "assessmentsCompleted",
                results.size()
        );

        analytics.put(
                "averageScore",
                calculateAverageScore(results)
        );

        analytics.put(
                "averageCompletionTimeSeconds",
                averageCompletionTime(results)
        );

        analytics.put(
                "totalAIInteractions",
                interactions.size()
        );

        analytics.put(
                "successfulAIInteractions",
                countByStatus(interactions, "SUCCESS")
        );

        analytics.put(
                "failedAIInteractions",
                countByStatus(interactions, "FAILED")
        );

        analytics.put(
                "averageAIProcessingTimeMs",
                averageAIProcessingTime(interactions)
        );

        analytics.put(
                "totalRecordedAIUsage",
                results.stream()
                        .map(Result::getAiUsage)
                        .filter(Objects::nonNull)
                        .mapToInt(Integer::intValue)
                        .sum()
        );

        analytics.put(
                "totalAIUsageFrequency",
                getUserAIUsageFrequency(userID)
        );

        analytics.put(
                "dailyAIUsageFrequency",
                getUserDailyAIUsageFrequency(userID)
        );

        return analytics;
    }

    // ==========================================
    // 3. ASSESSMENT ANALYTICS
    // ==========================================

    public List<Map<String, Object>>
    getAssessmentAnalytics() {

        List<Result> results =
                resultRepository.findAll();

        Map<Integer, List<Result>> groupedResults =
                results.stream()
                        .filter(result ->
                                result.getAssessmentId() != null)
                        .collect(Collectors.groupingBy(
                                Result::getAssessmentId,
                                LinkedHashMap::new,
                                Collectors.toList()
                        ));

        List<Map<String, Object>> analytics =
                new ArrayList<>();

        for (Map.Entry<Integer, List<Result>> entry
                : groupedResults.entrySet()) {

            List<Result> assessmentResults =
                    entry.getValue();

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put(
                    "assessmentID",
                    entry.getKey()
            );

            item.put(
                    "totalSubmissions",
                    assessmentResults.size()
            );

            item.put(
                    "averageScore",
                    calculateAverageScore(assessmentResults)
            );

            item.put(
                    "averageCompletionTimeSeconds",
                    averageCompletionTime(assessmentResults)
            );

            analytics.add(item);
        }

        return analytics;
    }

    // ==========================================
    // 4. AI USAGE ANALYTICS BY USER
    // ==========================================

    public List<Map<String, Object>>
    getAIUsageAnalytics() {

        List<AIInteraction> interactions =
                interactionRepository.findAll();

        Map<String, List<AIInteraction>> grouped =
                interactions.stream()
                        .filter(interaction ->
                                interaction.getUserID() != null)
                        .collect(Collectors.groupingBy(
                                AIInteraction::getUserID,
                                TreeMap::new,
                                Collectors.toList()
                        ));

        List<Map<String, Object>> analytics =
                new ArrayList<>();

        for (Map.Entry<String, List<AIInteraction>> entry
                : grouped.entrySet()) {

            String userID = entry.getKey();

            List<AIInteraction> userInteractions =
                    entry.getValue();

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put("userID", userID);

            item.put(
                    "totalInteractions",
                    userInteractions.size()
            );

            item.put(
                    "successfulInteractions",
                    countByStatus(
                            userInteractions,
                            "SUCCESS"
                    )
            );

            item.put(
                    "failedInteractions",
                    countByStatus(
                            userInteractions,
                            "FAILED"
                    )
            );

            item.put(
                    "averageProcessingTimeMs",
                    averageAIProcessingTime(
                            userInteractions
                    )
            );

            item.put(
                    "dailyInteractions",
                    getUserDailyAIUsageFrequency(userID)
            );

            analytics.add(item);
        }

        return analytics;
    }

    // ==========================================
    // 5. AVERAGE SCORE
    // ==========================================

    private double calculateAverageScore(
            List<Result> results) {

        return results.stream()
                .map(Result::getScore)
                .filter(Objects::nonNull)
                .mapToDouble(BigDecimal::doubleValue)
                .average()
                .orElse(0.0);
    }

    // ==========================================
    // 6. AVERAGE COMPLETION TIME
    // ==========================================

    private double averageCompletionTime(
            List<Result> results) {

        return results.stream()
                .map(Result::getCompletionTime)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
    }

    // ==========================================
    // 7. COUNT AI INTERACTIONS BY STATUS
    // ==========================================

    private long countByStatus(
            List<AIInteraction> interactions,
            String status) {

        return interactions.stream()
                .filter(interaction ->
                        status.equalsIgnoreCase(
                                interaction.getStatus()
                        ))
                .count();
    }

    // ==========================================
    // 8. AVERAGE AI PROCESSING TIME
    // ==========================================

    private double averageAIProcessingTime(
            List<AIInteraction> interactions) {

        return interactions.stream()
                .map(AIInteraction::getProcessingTimeMs)
                .filter(Objects::nonNull)
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);
    }

    // ==========================================
    // 9. USER AI USAGE FREQUENCY
    // ==========================================

    public long getUserAIUsageFrequency(
            String userID) {

        validateUserId(userID);

        return interactionRepository
                .countByUserID(userID);
    }

    // ==========================================
    // 10. DAILY AI USAGE FREQUENCY
    // ==========================================

    public long getDailyAIUsageFrequency() {

        LocalDate today = LocalDate.now();

        LocalDateTime startOfDay =
                today.atStartOfDay();

        LocalDateTime startOfTomorrow =
                today.plusDays(1).atStartOfDay();

        return interactionRepository
                .countByTimestampBetween(
                        startOfDay,
                        startOfTomorrow.minusNanos(1)
                );
    }

    // ==========================================
    // 11. USER DAILY AI USAGE
    // ==========================================

    public long getUserDailyAIUsageFrequency(
            String userID) {

        validateUserId(userID);

        LocalDate today = LocalDate.now();

        LocalDateTime startOfDay =
                today.atStartOfDay();

        LocalDateTime startOfTomorrow =
                today.plusDays(1).atStartOfDay();

        return interactionRepository
                .countByUserIDAndTimestampBetween(
                        userID,
                        startOfDay,
                        startOfTomorrow.minusNanos(1)
                );
    }

    // ==========================================
    // 12. COMPLETION TIME METRICS
    // ==========================================

    public List<Map<String, Object>>
    getCompletionTimeMetrics() {

        List<Result> results =
                resultRepository.findAll();

        Map<Integer, List<Result>> groupedResults =
                results.stream()
                        .filter(result ->
                                result.getAssessmentId() != null)
                        .collect(Collectors.groupingBy(
                                Result::getAssessmentId,
                                LinkedHashMap::new,
                                Collectors.toList()
                        ));

        List<Map<String, Object>> metrics =
                new ArrayList<>();

        for (Map.Entry<Integer, List<Result>> entry
                : groupedResults.entrySet()) {

            List<Result> assessmentResults =
                    entry.getValue();

            List<Integer> times =
                    assessmentResults.stream()
                            .map(Result::getCompletionTime)
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList());

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put(
                    "assessmentID",
                    entry.getKey()
            );

            item.put(
                    "totalSubmissions",
                    assessmentResults.size()
            );

            item.put(
                    "recordedCompletionTimes",
                    times.size()
            );

            item.put(
                    "averageCompletionTimeSeconds",
                    times.stream()
                            .mapToInt(Integer::intValue)
                            .average()
                            .orElse(0.0)
            );

            item.put(
                    "fastestCompletionTimeSeconds",
                    times.stream()
                            .mapToInt(Integer::intValue)
                            .min()
                            .orElse(0)
            );

            item.put(
                    "longestCompletionTimeSeconds",
                    times.stream()
                            .mapToInt(Integer::intValue)
                            .max()
                            .orElse(0)
            );

            metrics.add(item);
        }

        return metrics;
    }

    // ==========================================
    // 13. SAVE USER ANALYTICS TO MYSQL
    // ==========================================

    @Transactional
    public Analytics saveUserAnalytics(
            String userID) {

        validateUserId(userID);

        List<Result> results =
                resultRepository.findByUserId(userID);

        List<AIInteraction> interactions =
                interactionRepository.findByUserID(userID);

        Analytics analytics =
                analyticsRepository.findByUserId(userID)
                        .orElseGet(Analytics::new);

        analytics.setUserId(userID);

        int completedAssessments = results.size();

        analytics.setCompletedAssessments(
                completedAssessments
        );

        // Currently counts recorded results.
        // Assigned assessments require an additional repository.
        analytics.setTotalAssessments(
                completedAssessments
        );

        analytics.setAverageScore(
                calculateAverageScore(results)
        );

        analytics.setTotalAiInteractions(
                interactions.size()
        );

        analytics.setSuccessfulAiInteractions(
                Math.toIntExact(
                        countByStatus(interactions, "SUCCESS")
                )
        );

        analytics.setFailedAiInteractions(
                Math.toIntExact(
                        countByStatus(interactions, "FAILED")
                )
        );

        analytics.setAverageCompletionTime(
                averageCompletionTime(results)
        );

        analytics.setAverageAiProcessingTimeMs(
                averageAIProcessingTime(interactions)
        );

        return analyticsRepository.save(analytics);
    }

    // ==========================================
    // 14. GET SAVED ANALYTICS FOR ONE USER
    // ==========================================

    public Optional<Analytics> getSavedUserAnalytics(
            String userID) {

        validateUserId(userID);

        return analyticsRepository.findByUserId(userID);
    }

    // ==========================================
    // 15. GET ALL SAVED ANALYTICS
    // ==========================================

    public List<Analytics> getAllSavedAnalytics() {

        return analyticsRepository.findAll();
    }

    // ==========================================
    // 16. VALIDATION
    // ==========================================

    private void validateUserId(String userID) {

        if (userID == null || userID.isBlank()) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }
    }
}
