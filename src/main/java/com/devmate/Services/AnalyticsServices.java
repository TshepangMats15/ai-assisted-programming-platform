package com.devmate.Services;

import com.devmate.Entities.AIInteraction;
import com.devmate.Entities.Result;
import com.devmate.Repository.AIInteractionRepository;
import com.devmate.Repository.ResultRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsServices {

    private final ResultRepository resultRepository;
    private final AIInteractionRepository interactionRepository;

    public AnalyticsServices(
            ResultRepository resultRepository,
            AIInteractionRepository interactionRepository) {

        this.resultRepository = resultRepository;
        this.interactionRepository = interactionRepository;
    }

    // Overall dashboard statistics
    public Map<String, Object> getSummary() {

        List<Result> results = resultRepository.findAll();
        List<AIInteraction> interactions =
                interactionRepository.findAll();

        Map<String, Object> summary = new LinkedHashMap<>();

        summary.put("totalAssessmentsCompleted", results.size());
        summary.put("averageScore",
                calculateAverageScore(results));
        summary.put("averageCompletionTimeSeconds",
                averageCompletionTime(results));

        summary.put("totalAIInteractions", interactions.size());
        summary.put("successfulAIInteractions",
                countByStatus(interactions, "SUCCESS"));
        summary.put("failedAIInteractions",
                countByStatus(interactions, "FAILED"));
        summary.put("averageAIProcessingTimeMs",
                averageAIProcessingTime(interactions));

        summary.put("totalRecordedAIUsage",
                results.stream()
                        .map(Result::getAiUsage)
                        .filter(Objects::nonNull)
                        .mapToInt(Integer::intValue)
                        .sum());

        return summary;
    }

    // Analytics for an individual user
    public Map<String, Object> getUserAnalytics(String userID) {

        List<Result> results =
                resultRepository.findByUserID(userID);

        List<AIInteraction> interactions =
                interactionRepository.findByUserID(userID);

        Map<String, Object> analytics = new LinkedHashMap<>();

        analytics.put("userID", userID);
        analytics.put("assessmentsCompleted", results.size());
        analytics.put("averageScore",
                calculateAverageScore(results));
        analytics.put("averageCompletionTimeSeconds",
                averageCompletionTime(results));

        analytics.put("totalAIInteractions", interactions.size());
        analytics.put("successfulAIInteractions",
                countByStatus(interactions, "SUCCESS"));
        analytics.put("failedAIInteractions",
                countByStatus(interactions, "FAILED"));
        analytics.put("averageAIProcessingTimeMs",
                averageAIProcessingTime(interactions));

        analytics.put("totalRecordedAIUsage",
                results.stream()
                        .map(Result::getAiUsage)
                        .filter(Objects::nonNull)
                        .mapToInt(Integer::intValue)
                        .sum());

        // AI usage frequency for this user
        analytics.put("totalAIUsageFrequency",
                getUserAIUsageFrequency(userID));

        analytics.put("dailyAIUsageFrequency",
                getUserDailyAIUsageFrequency(userID));

        return analytics;
    }

    // Analytics grouped by assessment
    public List<Map<String, Object>> getAssessmentAnalytics() {

        List<Result> results = resultRepository.findAll();

        Map<Integer, List<Result>> groupedResults =
                results.stream()
                        .filter(result ->
                                result.getAssessmentID() != null)
                        .collect(Collectors.groupingBy(
                                Result::getAssessmentID,
                                LinkedHashMap::new,
                                Collectors.toList()));

        List<Map<String, Object>> analytics = new ArrayList<>();

        for (Map.Entry<Integer, List<Result>> entry
                : groupedResults.entrySet()) {

            List<Result> assessmentResults = entry.getValue();

            Map<String, Object> item = new LinkedHashMap<>();

            item.put("assessmentID", entry.getKey());
            item.put("totalSubmissions",
                    assessmentResults.size());
            item.put("averageScore",
                    calculateAverageScore(assessmentResults));
            item.put("averageCompletionTimeSeconds",
                    averageCompletionTime(assessmentResults));

            analytics.add(item);
        }

        return analytics;
    }

    // AI usage analytics grouped by user
    public List<Map<String, Object>> getAIUsageAnalytics() {

        List<AIInteraction> interactions =
                interactionRepository.findAll();

        Map<String, List<AIInteraction>> grouped =
                interactions.stream()
                        .filter(interaction ->
                                interaction.getUserID() != null)
                        .collect(Collectors.groupingBy(
                                AIInteraction::getUserID,
                                TreeMap::new,
                                Collectors.toList()));

        List<Map<String, Object>> analytics = new ArrayList<>();

        for (Map.Entry<String, List<AIInteraction>> entry
                : grouped.entrySet()) {

            String userID = entry.getKey();
            List<AIInteraction> userInteractions =
                    entry.getValue();

            Map<String, Object> item = new LinkedHashMap<>();

            item.put("userID", userID);
            item.put("totalInteractions",
                    userInteractions.size());
            item.put("successfulInteractions",
                    countByStatus(userInteractions, "SUCCESS"));
            item.put("failedInteractions",
                    countByStatus(userInteractions, "FAILED"));
            item.put("averageProcessingTimeMs",
                    averageAIProcessingTime(userInteractions));

            item.put("dailyInteractions",
                    getUserDailyAIUsageFrequency(userID));

            analytics.add(item);
        }

        return analytics;
    }

    // Average assessment score
    private double calculateAverageScore(List<Result> results) {

        return results.stream()
                .map(Result::getScore)
                .filter(Objects::nonNull)
                .mapToDouble(BigDecimal::doubleValue)
                .average()
                .orElse(0.0);
    }

    // Average completion time in seconds
    private double averageCompletionTime(List<Result> results) {

        return results.stream()
                .map(Result::getCompletionTime)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
    }

    // Count successful or failed AI interactions
    private long countByStatus(
            List<AIInteraction> interactions,
            String status) {

        return interactions.stream()
                .filter(interaction ->
                        status.equalsIgnoreCase(
                                interaction.getStatus()))
                .count();
    }

    // Average AI processing time in milliseconds
    private double averageAIProcessingTime(
            List<AIInteraction> interactions) {

        return interactions.stream()
                .map(AIInteraction::getProcessingTimeMs)
                .filter(Objects::nonNull)
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);
    }

    // Total AI interactions for a specific user
    public long getUserAIUsageFrequency(String userID) {

        return interactionRepository.countByUserID(userID);
    }

    // Total AI interactions recorded today
    public long getDailyAIUsageFrequency() {

        LocalDate today = LocalDate.now();

        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime startOfTomorrow =
                today.plusDays(1).atStartOfDay();

        return interactionRepository.countByTimestampBetween(
                startOfDay,
                startOfTomorrow.minusNanos(1));
    }

    // AI interactions for a specific user today
    public long getUserDailyAIUsageFrequency(String userID) {

        LocalDate today = LocalDate.now();

        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime startOfTomorrow =
                today.plusDays(1).atStartOfDay();

        return interactionRepository
                .countByUserIDAndTimestampBetween(
                        userID,
                        startOfDay,
                        startOfTomorrow.minusNanos(1));
    }

    //Completion-time metrics grouped by assessment
    public List<Map<String, Object>> getCompletionTimeMetrics() {

        List<Result> results = resultRepository.findAll();

        Map<Integer, List<Result>> groupedResults =
                results.stream()
                        .filter(result ->
                                result.getAssessmentID() != null)
                        .collect(Collectors.groupingBy(
                                Result::getAssessmentID,
                                LinkedHashMap::new,
                                Collectors.toList()));

        List<Map<String, Object>> metrics = new ArrayList<>();

        for (Map.Entry<Integer, List<Result>> entry
                : groupedResults.entrySet()) {

            List<Result> assessmentResults = entry.getValue();

            List<Integer> times = assessmentResults.stream()
                    .map(Result::getCompletionTime)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            Map<String, Object> item = new LinkedHashMap<>();

            item.put("assessmentID", entry.getKey());
            item.put("totalSubmissions", assessmentResults.size());
            item.put("recordedCompletionTimes", times.size());

            item.put("averageCompletionTimeSeconds",
                    times.stream()
                            .mapToInt(Integer::intValue)
                            .average()
                            .orElse(0.0));

            item.put("fastestCompletionTimeSeconds",
                    times.stream()
                            .mapToInt(Integer::intValue)
                            .min()
                            .orElse(0));

            item.put("longestCompletionTimeSeconds",
                    times.stream()
                            .mapToInt(Integer::intValue)
                            .max()
                            .orElse(0));

            metrics.add(item);
        }

        return metrics;
    }

}
