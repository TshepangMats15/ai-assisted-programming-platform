package com.devmate.Services;

import AI.Productivity.Platform.entity.Result;
import AI.Productivity.Platform.repository.ResultRepository;
import AI.Productivity.Platform.repository.SubmissionRepository;
import com.devmate.Entities.AIInteraction;
import com.devmate.Entities.Assessment;
import com.devmate.Repository.AIInteractionRepository;
import com.devmate.Repository.AssessmentRepository;
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
    private final SubmissionRepository submissionRepository;
    private final AssessmentRepository assessmentRepository;

    public AnalyticsServices(
            ResultRepository resultRepository,
            AIInteractionRepository interactionRepository,
            SubmissionRepository submissionRepository,
            AssessmentRepository assessmentRepository) {
        this.resultRepository = resultRepository;
        this.interactionRepository = interactionRepository;
        this.submissionRepository = submissionRepository;
        this.assessmentRepository = assessmentRepository;
    }

    public Map<String, Object> getSummary() {
        List<Result> results = resultRepository.findAll();
        List<AIInteraction> interactions = interactionRepository.findAll();
        long totalAssessments = assessmentRepository.count();
        long totalSubmissions = submissionRepository.count();

        Map<String, Object> summary = new LinkedHashMap<>();

        // Keys required by Admin Reports Screen
        summary.put("assessments", totalAssessments > 0 ? (int) totalAssessments : results.size());
        summary.put("submissions", (int) totalSubmissions);
        summary.put("resultsRecorded", results.size());
        summary.put("aiInteractions", interactions.size());
        summary.put("averageScore", calculateAverageScore(results));

        // Existing / alias keys for backward compatibility
        summary.put("totalAssessmentsCompleted", results.size());
        summary.put("totalAssessments", (int) totalAssessments);
        summary.put("totalSubmissions", (int) totalSubmissions);
        summary.put("totalAIInteractions", interactions.size());
        summary.put("totalAiInteractions", interactions.size());
        summary.put("avgSimilarityScore", null); // Baseline benchmark
        summary.put("averageCompletionTimeSeconds", averageCompletionTime(results));
        summary.put("successfulAIInteractions", countByStatus(interactions, "SUCCESS"));
        summary.put("failedAIInteractions", countByStatus(interactions, "FAILED"));
        summary.put("averageAIProcessingTimeMs", averageAIProcessingTime(interactions));

        return summary;
    }

   public List<Map<String, Object>> getAIUsageAnalytics() {

    List<Assessment> assessments =
            assessmentRepository.findAll();

    List<AIInteraction> interactions =
            interactionRepository.findAll();

    Map<Integer, List<AIInteraction>> byAssessment =
            interactions.stream()
                    .filter(i -> i.getAssessmentID() != null)
                    .filter(i ->
                            "SUCCESS".equalsIgnoreCase(i.getStatus())
                    )
                    .collect(Collectors.groupingBy(
                            AIInteraction::getAssessmentID
                    ));

    List<Map<String, Object>> list = new ArrayList<>();

    for (Assessment assessment : assessments) {

        List<AIInteraction> related =
                byAssessment.getOrDefault(
                        assessment.getAssessmentID(),
                        Collections.emptyList()
                );

        long uniqueStudents = related.stream()
                .map(AIInteraction::getUserID)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        double averageRequests = uniqueStudents == 0
                ? 0.0
                : (double) related.size() / uniqueStudents;

        Map<String, Object> item = new LinkedHashMap<>();

        item.put(
                "id",
                String.valueOf(assessment.getAssessmentID())
        );

        item.put(
                "course",
                assessment.getProgramLang() != null
                        ? assessment.getProgramLang() + " Programming"
                        : "Coursework"
        );

        item.put("quiz", assessment.getTitle());
        item.put("totalRequests", related.size());
        item.put("uniqueStudents", uniqueStudents);
        item.put("avgRequests", averageRequests);
        item.put("aiAllowed", assessment.getAiAllowed());
        item.put("trend", "neutral");

        list.add(item);
    }

    return list;
}

    public Map<String, Object> getUserAnalytics(String userID) {
        validateUserId(userID);
        List<Result> results = resultRepository.findByUserId(userID);
        List<AIInteraction> interactions = interactionRepository.findByUserID(userID);

        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("userID", userID);
        analytics.put("assessmentsCompleted", results.size());
        analytics.put("averageScore", calculateAverageScore(results));
        analytics.put("averageCompletionTimeSeconds", averageCompletionTime(results));
        analytics.put("totalAIInteractions", interactions.size());
        analytics.put("successfulAIInteractions", countByStatus(interactions, "SUCCESS"));
        analytics.put("failedAIInteractions", countByStatus(interactions, "FAILED"));
        analytics.put("averageAIProcessingTimeMs", averageAIProcessingTime(interactions));
        analytics.put("totalAIUsageFrequency", getUserAIUsageFrequency(userID));
        analytics.put("dailyAIUsageFrequency", getUserDailyAIUsageFrequency(userID));
        return analytics;
    }

    public List<Map<String, Object>> getAssessmentAnalytics() {
        List<Result> results = resultRepository.findAll();
        Map<Integer, List<Result>> groupedResults = results.stream()
                .filter(r -> r.getAssessmentId() != null)
                .collect(Collectors.groupingBy(Result::getAssessmentId, LinkedHashMap::new, Collectors.toList()));

        List<Map<String, Object>> analytics = new ArrayList<>();
        for (Map.Entry<Integer, List<Result>> entry : groupedResults.entrySet()) {
            List<Result> assessmentResults = entry.getValue();
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("assessmentID", entry.getKey());
            item.put("totalSubmissions", assessmentResults.size());
            item.put("averageScore", calculateAverageScore(assessmentResults));
            item.put("averageCompletionTimeSeconds", averageCompletionTime(assessmentResults));
            analytics.add(item);
        }
        return analytics;
    }

    public long getUserAIUsageFrequency(String userID) {
        validateUserId(userID);
        return interactionRepository.countByUserID(userID);
    }

    public long getDailyAIUsageFrequency() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime startOfTomorrow = today.plusDays(1).atStartOfDay();
        return interactionRepository.countByTimestampBetween(startOfDay, startOfTomorrow.minusNanos(1));
    }

    public long getUserDailyAIUsageFrequency(String userID) {
        validateUserId(userID);
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime startOfTomorrow = today.plusDays(1).atStartOfDay();
        return interactionRepository.countByUserIDAndTimestampBetween(userID, startOfDay, startOfTomorrow.minusNanos(1));
    }

    public List<Map<String, Object>> getCompletionTimeMetrics() {
        List<Result> results = resultRepository.findAll();
        Map<Integer, List<Result>> groupedResults = results.stream()
                .filter(r -> r.getAssessmentId() != null)
                .collect(Collectors.groupingBy(Result::getAssessmentId, LinkedHashMap::new, Collectors.toList()));

        List<Map<String, Object>> metrics = new ArrayList<>();
        for (Map.Entry<Integer, List<Result>> entry : groupedResults.entrySet()) {
            List<Result> assessmentResults = entry.getValue();
            List<Integer> times = assessmentResults.stream()
                    .map(Result::getCompletionTime)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("assessmentID", entry.getKey());
            item.put("totalSubmissions", assessmentResults.size());
            item.put("recordedCompletionTimes", times.size());
            item.put("averageCompletionTimeSeconds", times.stream().mapToInt(Integer::intValue).average().orElse(0.0));
            item.put("fastestCompletionTimeSeconds", times.stream().mapToInt(Integer::intValue).min().orElse(0));
            item.put("longestCompletionTimeSeconds", times.stream().mapToInt(Integer::intValue).max().orElse(0));
            metrics.add(item);
        }
        return metrics;
    }

    private double calculateAverageScore(List<Result> results) {
        return results.stream()
                .map(Result::getScore)
                .filter(Objects::nonNull)
                .mapToDouble(BigDecimal::doubleValue)
                .average()
                .orElse(0.0);
    }

    private double averageCompletionTime(List<Result> results) {
        return results.stream()
                .map(Result::getCompletionTime)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
    }

    private long countByStatus(List<AIInteraction> interactions, String status) {
        return interactions.stream()
                .filter(i -> status.equalsIgnoreCase(i.getStatus()))
                .count();
    }

    private double averageAIProcessingTime(List<AIInteraction> interactions) {
        return interactions.stream()
                .map(AIInteraction::getProcessingTimeMs)
                .filter(Objects::nonNull)
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);
    }

    private void validateUserId(String userID) {
        if (userID == null || userID.isBlank()) {
            throw new IllegalArgumentException("User ID is required");
        }
    }
}