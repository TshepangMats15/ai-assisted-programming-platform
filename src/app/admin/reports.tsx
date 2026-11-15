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

import api, { ReportsAnalytics } from "../../constants/api";

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
  red: "#EF4444",
  green: "#4ADE80",
};

export default function AdminReportsScreen() {
  const [reports, setReports] = useState<ReportsAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // LOAD REPORT DATA FROM SPRING BOOT
  // GET /api/analytics/reports
  // =========================================================

  const loadReports = useCallback(async () => {
    try {
      setErrorMessage("");

      const response = await api.analytics.getReports();

      setReports(response);
    } catch (error: any) {
      console.error("Failed to load reports:", error);

      setReports(null);

      setErrorMessage(
        error?.message ||
          "Reports could not be loaded. Please check your backend connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // =========================================================
  // REFRESH
  // =========================================================

  const refreshReports = () => {
    setRefreshing(true);
    loadReports();
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/admin/adminindex" as any);
    }
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.purple}
          />

          <Text style={styles.loadingText}>
            Loading reports...
          </Text>

          <Text style={styles.loadingSubtext}>
            Connecting to DevMate backend
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =========================================================
  // MAIN SCREEN
  // =========================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
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
          disabled={refreshing}
          accessibilityRole="button"
          accessibilityLabel="Refresh reports"
        >
          {refreshing ? (
            <ActivityIndicator
              size="small"
              color={COLORS.lightPurple}
            />
          ) : (
            <Ionicons
              name="refresh"
              size={21}
              color={COLORS.lightPurple}
            />
          )}
        </TouchableOpacity>
      </View>

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
          Review assessment performance, submissions,
          results and AI activity across DevMate.
        </Text>

        {/* ERROR */}

        {errorMessage !== "" && (
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={23}
              color={COLORS.red}
            />

            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>
                Reports could not be loaded
              </Text>

              <Text style={styles.errorText}>
                {errorMessage}
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={loadReports}
              >
                <Ionicons
                  name="refresh"
                  size={17}
                  color={COLORS.white}
                />

                <Text style={styles.retryText}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* PLATFORM OVERVIEW */}

        <Text style={styles.sectionTitle}>
          Platform Overview
        </Text>

        <View style={styles.metricsRow}>
          <MetricCard
            title="Assessments"
            value={formatNumber(reports?.assessments)}
            icon="clipboard-outline"
          />

          <MetricCard
            title="Submissions"
            value={formatNumber(reports?.submissions)}
            icon="document-text-outline"
          />
        </View>

        <View style={styles.metricsRow}>
          <MetricCard
            title="Average Score"
            value={formatPercentage(reports?.averageScore)}
            icon="analytics-outline"
          />

          <MetricCard
            title="AI Interactions"
            value={formatNumber(reports?.aiInteractions)}
            icon="chatbubbles-outline"
          />
        </View>

        {/* PERFORMANCE */}

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
                Live analytics from the DevMate backend
              </Text>
            </View>
          </View>

          <PerformanceRow
            label="Assessments"
            value={formatNumber(reports?.assessments)}
          />

          <View style={styles.divider} />

          <PerformanceRow
            label="Submissions"
            value={formatNumber(reports?.submissions)}
          />

          <View style={styles.divider} />

          <PerformanceRow
            label="Results recorded"
            value={formatNumber(reports?.resultsRecorded)}
          />

          <View style={styles.divider} />

          <PerformanceRow
            label="Average score"
            value={formatPercentage(reports?.averageScore)}
          />
        </View>

        {/* AI ANALYTICS */}

        <Text style={styles.sectionTitle}>
          AI Analytics
        </Text>

        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles-outline"
              size={24}
              color={COLORS.lightPurple}
            />
          </View>

          <View style={styles.aiContent}>
            <Text style={styles.cardTitle}>
              Gemini AI Usage
            </Text>

            <Text style={styles.aiDescription}>
              Total AI interactions recorded by DevMate.
            </Text>

            <Text style={styles.aiValue}>
              {formatNumber(reports?.aiInteractions)}
            </Text>
          </View>
        </View>

        {/* CONNECTION STATUS */}

        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusDot,
              reports ? styles.statusOnline : styles.statusOffline,
            ]}
          />

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              Backend Status
            </Text>

            <Text style={styles.statusText}>
              {reports
                ? "Reports successfully loaded from the DevMate backend."
                : "Report data is currently unavailable."}
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          Report figures are retrieved from the DevMate
          analytics API. No sample statistics are inserted
          by this screen.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// =========================================================
// COMPONENTS
// =========================================================

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

function PerformanceRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.performanceRow}>
      <Text style={styles.performanceLabel}>
        {label}
      </Text>

      <Text style={styles.performanceValue}>
        {value}
      </Text>
    </View>
  );
}

// =========================================================
// FORMATTERS
// =========================================================

function formatNumber(value: unknown): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return "Unavailable";
  }

  return value.toLocaleString();
}

function formatPercentage(value: unknown): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return "Unavailable";
  }

  return `${value.toFixed(1)}%`;
}

// =========================================================
// STYLES
// =========================================================

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
    paddingHorizontal: 30,
  },

  loadingText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 17,
  },

  loadingSubtext: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 7,
  },

  pageDescription: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 25,
  },

  errorCard: {
    backgroundColor: "#211416",
    borderColor: "#442024",
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  errorContent: {
    flex: 1,
    marginLeft: 11,
  },

  errorTitle: {
    color: "#FCA5A5",
    fontSize: 14,
    fontWeight: "bold",
  },

  errorText: {
    color: "#D1A5A5",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  retryButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.purple,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 12,
  },

  retryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
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
    paddingVertical: 11,
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

  aiCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.purpleBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  aiContent: {
    flex: 1,
  },

  aiDescription: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  aiValue: {
    color: COLORS.lightPurple,
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
  },

  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },

  statusOnline: {
    backgroundColor: COLORS.green,
  },

  statusOffline: {
    backgroundColor: COLORS.red,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "bold",
  },

  statusText: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
  },
});