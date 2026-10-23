
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

import api from "../../constants/api";

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

type CourseUsage = {
  id: string;
  course: string;
  quiz: string;
  avgRequests: number | null;
  trend: "up" | "down" | "neutral" | null;
};

type AiMetrics = {
  totalAiInteractions: number | null;
  totalSubmissions: number | null;
  avgSimilarityScore: number | null;
  courseUsage: CourseUsage[];
};

function readNumber(value: unknown): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  ) {
    return value;
  }

  return null;
}

function displayNumber(value: number | null): string {
  return value === null
    ? "Unavailable"
    : value.toLocaleString();
}

export default function AdminAiUsageScreen() {
  const [metrics, setMetrics] = useState<AiMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      setErrorMessage("");

      // Keep the existing backend API methods.
      const [usageResult, summaryResult] =
        await Promise.allSettled([
          api.analytics.getAiUsage(),
          api.analytics.getSummary(),
        ]);

      const usageData =
        usageResult.status === "fulfilled"
          ? usageResult.value
          : null;

      const summaryData =
        summaryResult.status === "fulfilled"
          ? summaryResult.value
          : null;

      if (usageData === null && summaryData === null) {
        setMetrics(null);
        setErrorMessage(
          "AI analytics could not be loaded. Please check your connection and try again."
        );
        return;
      }

      // Only display actual values returned by the backend.
      // Do not substitute invented metrics.
      const summary =
        summaryData &&
        typeof summaryData === "object"
          ? summaryData
          : {};

      const rawCourses = Array.isArray(usageData)
        ? usageData
        : [];

      const courseUsage: CourseUsage[] = rawCourses.map(
        (item: any, index: number) => ({
          id: String(item?.id ?? index),
          course:
            typeof item?.course === "string" &&
            item.course.trim()
              ? item.course
              : "Unspecified course",
          quiz:
            typeof item?.quiz === "string" &&
            item.quiz.trim()
              ? item.quiz
              : "Unspecified topic",
          avgRequests: readNumber(item?.avgRequests),
          trend:
            item?.trend === "up" ||
            item?.trend === "down" ||
            item?.trend === "neutral"
              ? item.trend
              : null,
        })
      );

      const overview = summary as {
        totalAiInteractions?: unknown;
        totalSubmissions?: unknown;
        avgSimilarityScore?: unknown;
      };

      setMetrics({
        totalAiInteractions: readNumber(
          overview.totalAiInteractions
        ),
        totalSubmissions: readNumber(
          overview.totalSubmissions
        ),
        avgSimilarityScore: readNumber(
          overview.avgSimilarityScore
        ),
        courseUsage,
      });

      if (
        usageResult.status === "rejected" ||
        summaryResult.status === "rejected"
      ) {
        setErrorMessage(
          "Some analytics could not be loaded. Available results are shown below."
        );
      }
    } catch {
      setMetrics(null);
      setErrorMessage(
        "Something went wrong while loading AI analytics."
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  function refreshData() {
    setRefreshing(true);
    loadAnalytics();
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/admin/adminindex");
    }
  }

  const aiInteractions =
    metrics?.totalAiInteractions ?? null;

  const totalSubmissions =
    metrics?.totalSubmissions ?? null;

  const similarity =
    metrics?.avgSimilarityScore ?? null;

  const courseUsage = metrics?.courseUsage ?? [];

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
            AI Usage
          </Text>

          <Text style={styles.headerSubtitle}>
            DevMate Admin Portal
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshData}
          disabled={isLoading || refreshing}
          accessibilityRole="button"
          accessibilityLabel="Refresh AI analytics"
        >
          <Ionicons
            name="refresh"
            size={21}
            color={COLORS.lightPurple}
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.purple}
          />

          <Text style={styles.loadingText}>
            Loading AI analytics...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshData}
              tintColor={COLORS.purple}
              colors={[COLORS.purple]}
            />
          }
        >
          <Text style={styles.pageDescription}>
            Monitor AI assistance activity and usage
            across the DevMate learning platform.
          </Text>

          {/* ERROR / PARTIAL DATA MESSAGE */}
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
            Usage Overview
          </Text>

          <View style={styles.metricsGrid}>
            <MetricCard
              title="AI Interactions"
              value={displayNumber(aiInteractions)}
              icon="chatbubbles-outline"
            />

            <MetricCard
              title="Total Submissions"
              value={displayNumber(totalSubmissions)}
              icon="document-text-outline"
            />
          </View>

          {/* SIMILARITY */}
          <View style={styles.similarityCard}>
            <View style={styles.similarityHeader}>
              <View style={styles.similarityIcon}>
                <Ionicons
                  name="analytics-outline"
                  size={23}
                  color={COLORS.lightPurple}
                />
              </View>

              <View style={styles.similarityHeaderText}>
                <Text style={styles.cardTitle}>
                  Average AI Similarity
                </Text>

                <Text style={styles.cardSubtitle}>
                  Code similarity metric
                </Text>
              </View>
            </View>

            <Text style={styles.similarityValue}>
              {similarity === null
                ? "Unavailable"
                : `${similarity}%`}
            </Text>

            <Text style={styles.similarityNote}>
              This value is shown only if the backend
              provides an average similarity score.
            </Text>
          </View>

          {/* IMPORTANT METRIC CLARIFICATION */}
          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={COLORS.lightPurple}
            />

            <Text style={styles.infoText}>
              AI interactions and code submissions are
              different activity counts. They cannot
              reliably be used as a percentage of
              AI-assisted versus manual answers.
            </Text>
          </View>

          {/* COURSE USAGE */}
          <Text style={styles.sectionTitle}>
            AI Usage by Course
          </Text>

          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text
                style={[
                  styles.tableHeaderText,
                  styles.courseColumn,
                ]}
              >
                Course
              </Text>

              <Text
                style={[
                  styles.tableHeaderText,
                  styles.topicColumn,
                ]}
              >
                Topic
              </Text>

              <Text
                style={[
                  styles.tableHeaderText,
                  styles.requestsColumn,
                ]}
              >
                Avg. Req.
              </Text>
            </View>

            {courseUsage.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={30}
                    color={COLORS.lightPurple}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No course usage data
                </Text>

                <Text style={styles.emptyDescription}>
                  Course-level AI usage has not been
                  provided by the backend.
                </Text>
              </View>
            ) : (
              courseUsage.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.tableRow,
                    index < courseUsage.length - 1 &&
                      styles.rowDivider,
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      styles.courseColumn,
                      styles.courseName,
                    ]}
                    numberOfLines={2}
                  >
                    {item.course}
                  </Text>

                  <Text
                    style={[
                      styles.tableCell,
                      styles.topicColumn,
                    ]}
                    numberOfLines={2}
                  >
                    {item.quiz}
                  </Text>

                  <View
                    style={[
                      styles.requestsColumn,
                      styles.requestsContent,
                    ]}
                  >
                    <Text style={styles.requestValue}>
                      {item.avgRequests === null
                        ? "—"
                        : String(item.avgRequests)}
                    </Text>

                    {item.trend === "up" && (
                      <Ionicons
                        name="arrow-up"
                        size={14}
                        color="#F87171"
                      />
                    )}

                    {item.trend === "down" && (
                      <Ionicons
                        name="arrow-down"
                        size={14}
                        color={COLORS.green}
                      />
                    )}

                    {item.trend === "neutral" && (
                      <Ionicons
                        name="remove"
                        size={14}
                        color={COLORS.muted}
                      />
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          <Text style={styles.footerText}>
            Pull down or tap refresh to reload analytics.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// REUSABLE METRIC CARD
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
          size={23}
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
    justifyContent: "center",
    alignItems: "center",
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

  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  metricCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    minHeight: 155,
  },

  metricIcon: {
    width: 43,
    height: 43,
    borderRadius: 10,
    backgroundColor: COLORS.purpleBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  metricTitle: {
    color: COLORS.secondary,
    fontSize: 12,
    marginBottom: 10,
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

  similarityCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },

  similarityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  similarityIcon: {
    width: 43,
    height: 43,
    borderRadius: 10,
    backgroundColor: COLORS.purpleBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  similarityHeaderText: {
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

  similarityValue: {
    color: COLORS.lightPurple,
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
  },

  similarityNote: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  infoCard: {
    backgroundColor: "#17131F",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.purpleBackground,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 28,
  },

  infoText: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 19,
    marginLeft: 10,
    flex: 1,
  },

  tableCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  tableHeaderText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "bold",
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },

  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  tableCell: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 18,
  },

  courseName: {
    color: COLORS.white,
    fontWeight: "600",
  },

  courseColumn: {
    flex: 1.3,
    paddingRight: 8,
  },

  topicColumn: {
    flex: 1.5,
    paddingRight: 8,
  },

  requestsColumn: {
    flex: 1,
  },

  requestsContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  requestValue: {
    color: COLORS.lightPurple,
    fontSize: 13,
    fontWeight: "bold",
    marginRight: 4,
  },

  emptyContainer: {
    paddingVertical: 30,
    alignItems: "center",
  },

  emptyIcon: {
    width: 58,
    height: 58,
    backgroundColor: COLORS.purpleBackground,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 13,
  },

  emptyTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },

  emptyDescription: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
  },
});
