
import React, { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import api, {
  AnalyticsSummary,
  ResultRecord,
  SubmissionRecord,
} from "../../constants/api";

const COLORS = {
  background: "#0D0D0D",
  card: "#1A1A1A",
  purple: "#8B5CF6",
  lightPurple: "#A78BFA",
  purpleBackground: "#2D2140",
  white: "#FFFFFF",
  secondary: "#A3A3A3",
  muted: "#888888",
  border: "#292929",
  green: "#4ADE80",
};

type ReportData = {
  summary: AnalyticsSummary | null;
  results: ResultRecord[] | null;
  submissions: SubmissionRecord[] | null;
  aiUsage: unknown[] | null;
};

function validNumber(value: unknown): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  ) {
    return value;
  }

  return null;
}

function formatNumber(value: number | null): string {
  return value === null
    ? "Unavailable"
    : value.toLocaleString();
}

function formatDate(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminReportsScreen() {
  const [data, setData] = useState<ReportData>({
    summary: null,
    results: null,
    submissions: null,
    aiUsage: null,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setErrorMessage("");

      const [
        summaryResult,
        resultsResult,
        submissionsResult,
        aiUsageResult,
      ] = await Promise.allSettled([
        api.analytics.getSummary(),
        api.results.getAll(),
        api.submissions.getAll(),
        api.analytics.getAiUsage(),
      ]);

      const summary =
        summaryResult.status === "fulfilled" &&
        summaryResult.value &&
        typeof summaryResult.value === "object" &&
        !Array.isArray(summaryResult.value)
          ? summaryResult.value
          : null;

      const results =
        resultsResult.status === "fulfilled" &&
        Array.isArray(resultsResult.value)
          ? resultsResult.value
          : null;

      const submissions =
        submissionsResult.status === "fulfilled" &&
        Array.isArray(submissionsResult.value)
          ? submissionsResult.value
          : null;

      const aiUsage =
        aiUsageResult.status === "fulfilled" &&
        Array.isArray(aiUsageResult.value)
          ? aiUsageResult.value
          : null;

      setData({
        summary,
        results,
        submissions,
        aiUsage,
      });

      const failedCount = [
        summary === null,
        results === null,
        submissions === null,
        aiUsage === null,
      ].filter(Boolean).length;

      if (failedCount === 4) {
        setErrorMessage(
          "Reports could not be loaded. Please check your backend connection and try again."
        );
      } else if (failedCount > 0) {
        setErrorMessage(
          "Some report information is unavailable. Successfully loaded data is shown below."
        );
      }
    } catch {
      setErrorMessage(
        "An unexpected error occurred while loading reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  function refreshReports() {
    setRefreshing(true);
    loadReports();
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/admin/adminindex");
    }
  }

  const totalAssessments = validNumber(
    data.summary?.totalAssessments
  );

  const totalSubmissions =
    validNumber(data.summary?.totalSubmissions) ??
    (data.submissions !== null
      ? data.submissions.length
      : null);

  const averageScore = validNumber(
    data.summary?.averageScore
  );

  const totalAiInteractions = validNumber(
    data.summary?.totalAiInteractions
  );

  const recentResults =
    data.results === null
      ? []
      : [...data.results]
          .sort((a, b) => {
            const dateA = new Date(
              a.submittedAt ?? ""
            ).getTime();

            const dateB = new Date(
              b.submittedAt ?? ""
            ).getTime();

            return (
              (Number.isFinite(dateB) ? dateB : 0) -
              (Number.isFinite(dateA) ? dateA : 0)
            );
          })
          .slice(0, 8);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          accessibilityRole="button"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.white}
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Reports
          </Text>

          <Text style={styles.headerSubtitle}>
            DevMate Admin Portal
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshReports}
          disabled={loading || refreshing}
          accessibilityRole="button"
          accessibilityLabel="Refresh reports"
        >
          <Ionicons
            name="refresh"
            size={21}
            color={COLORS.lightPurple}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.purple}
          />

          <Text style={styles.loadingText}>
            Loading reports...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshReports}
              tintColor={COLORS.purple}
              colors={[COLORS.purple]}
            />
          }
        >
          <Text style={styles.pageDescription}>
            Review assessment performance, submissions
            and AI activity across DevMate.
          </Text>

          {/* DATA STATUS */}
          {errorMessage !== "" && (
            <View style={styles.noticeCard}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color={COLORS.lightPurple}
              />

              <Text style={styles.noticeText}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* OVERVIEW */}
          <Text style={styles.sectionTitle}>
            Platform Overview
          </Text>

          <View style={styles.metricsRow}>
            <MetricCard
              title="Assessments"
              value={formatNumber(totalAssessments)}
              icon="clipboard-outline"
            />

            <MetricCard
              title="Submissions"
              value={formatNumber(totalSubmissions)}
              icon="document-text-outline"
            />
          </View>

          <View style={styles.metricsRow}>
            <MetricCard
              title="Average Score"
              value={
                averageScore === null
                  ? "Unavailable"
                  : `${averageScore}%`
              }
              icon="analytics-outline"
            />

            <MetricCard
              title="AI Interactions"
              value={formatNumber(totalAiInteractions)}
              icon="chatbubbles-outline"
            />
          </View>

          {/* PERFORMANCE SECTION */}
          <Text style={styles.sectionTitle}>
            Performance Summary
          </Text>

          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <View style={styles.performanceIcon}>
                <Ionicons
                  name="school-outline"
                  size={24}
                  color={COLORS.lightPurple}
                />
              </View>

              <View style={styles.performanceHeaderText}>
                <Text style={styles.cardTitle}>
                  Student Performance
                </Text>

                <Text style={styles.cardSubtitle}>
                  Based on available backend results
                </Text>
              </View>
            </View>

            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>
                Results recorded
              </Text>

              <Text style={styles.performanceValue}>
                {formatNumber(
                  data.results === null
                    ? null
                    : data.results.length
                )}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>
                Average score
              </Text>

              <Text style={styles.performanceValue}>
                {averageScore === null
                  ? "Unavailable"
                  : `${averageScore}%`}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>
                Submission records
              </Text>

              <Text style={styles.performanceValue}>
                {formatNumber(
                  data.submissions === null
                    ? null
                    : data.submissions.length
                )}
              </Text>
            </View>
          </View>

          {/* RECENT RESULTS */}
          <Text style={styles.sectionTitle}>
            Recent Assessment Results
          </Text>

          <View style={styles.resultsCard}>
            <View style={styles.resultsHeader}>
              <Text
                style={[
                  styles.tableHeader,
                  styles.colStudent,
                ]}
              >
                Student ID
              </Text>

              <Text
                style={[
                  styles.tableHeader,
                  styles.colAssessment,
                ]}
              >
                Assessment
              </Text>

              <Text
                style={[
                  styles.tableHeader,
                  styles.colScore,
                ]}
              >
                Score
              </Text>
            </View>

            {data.results === null ? (
              <EmptyState
                message="Assessment results are unavailable."
              />
            ) : recentResults.length === 0 ? (
              <EmptyState
                message="No assessment results have been recorded."
              />
            ) : (
              recentResults.map((item, index) => (
                <View
                  key={String(
                    item.resultId ?? index
                  )}
                  style={[
                    styles.resultRow,
                    index < recentResults.length - 1 &&
                      styles.resultDivider,
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      styles.colStudent,
                    ]}
                    numberOfLines={2}
                  >
                    {item.userId
                      ? String(item.userId)
                      : "Unknown"}
                  </Text>

                  <Text
                    style={[
                      styles.tableCell,
                      styles.colAssessment,
                    ]}
                    numberOfLines={2}
                  >
                    {item.assessmentId != null
                      ? `#${item.assessmentId}`
                      : "Unknown"}
                  </Text>

                  <Text
                    style={[
                      styles.tableCell,
                      styles.colScore,
                      styles.scoreText,
                    ]}
                  >
                    {validNumber(item.score) === null
                      ? "—"
                      : `${item.score}%`}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* AI DATA STATUS */}
          <View style={styles.aiCard}>
            <View style={styles.aiIcon}>
              <Ionicons
                name="sparkles-outline"
                size={23}
                color={COLORS.lightPurple}
              />
            </View>

            <View style={styles.aiContent}>
              <Text style={styles.cardTitle}>
                AI Analytics
              </Text>

              <Text style={styles.aiDescription}>
                {data.aiUsage === null
                  ? "Detailed AI usage data is currently unavailable."
                  : data.aiUsage.length === 0
                  ? "No course-level AI usage records were returned."
                  : `${data.aiUsage.length} AI usage records returned by the backend.`}
              </Text>
            </View>
          </View>

          <Text style={styles.footerText}>
            Report figures are based on available API data.
            No sample statistics are inserted.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ================= REUSABLE COMPONENTS =================

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>
        <Ionicons
          name={icon}
          size={22}
          color={COLORS.lightPurple}
        />
      </View>

      <Text style={styles.metricTitle}>
        {title}
      </Text>

      <Text
        style={[
          styles.metricValue,
          value === "Unavailable" &&
            styles.unavailableValue,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="document-text-outline"
        size={28}
        color={COLORS.lightPurple}
      />

      <Text style={styles.emptyText}>
        {message}
      </Text>
    </View>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.purpleBackground,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 45,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.secondary,
    fontSize: 13,
    marginTop: 15,
  },

  pageDescription: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 25,
  },

  noticeCard: {
    backgroundColor: "#17131F",
    borderColor: COLORS.purpleBackground,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  noticeText: {
    color: "#D8B4FE",
    fontSize: 12,
    lineHeight: 19,
    marginLeft: 10,
    flex: 1,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
  },

  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  metricCard: {
    backgroundColor: COLORS.card,
    width: "48%",
    borderRadius: 12,
    padding: 15,
    minHeight: 145,
  },

  metricIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.purpleBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  metricTitle: {
    color: COLORS.secondary,
    fontSize: 12,
    marginBottom: 9,
  },

  metricValue: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "bold",
  },

  unavailableValue: {
    color: COLORS.muted,
    fontSize: 13,
  },

  performanceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    marginBottom: 27,
  },

  performanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  performanceIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.purpleBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  performanceHeaderText: {
    flex: 1,
  },

  cardTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
  },

  cardSubtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 4,
  },

  performanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  performanceLabel: {
    color: COLORS.secondary,
    fontSize: 13,
  },

  performanceValue: {
    color: COLORS.lightPurple,
    fontSize: 14,
    fontWeight: "bold",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  resultsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 13,
    marginBottom: 20,
  },

  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  tableHeader: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "bold",
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },

  resultDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  tableCell: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 17,
  },

  colStudent: {
    flex: 1.5,
    paddingRight: 8,
  },

  colAssessment: {
    flex: 1.1,
    paddingRight: 8,
  },

  colScore: {
    flex: 0.8,
    textAlign: "right",
  },

  scoreText: {
    color: COLORS.lightPurple,
    fontWeight: "bold",
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },

  emptyText: {
    color: COLORS.secondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },

  aiCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  aiIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.purpleBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  aiContent: {
    flex: 1,
  },

  aiDescription: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
  },
});
