// DevMate Student Submissions Screen

import React, { useState, useCallback } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../context/ThemeContext";
import api, { SubmissionRecord } from "../constants/api";

export default function SubmissionScreen() {
  const [submissions, setSubmissions] = useState<
    SubmissionRecord[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(
    null
  );

  const { isDark, colors } = useAppTheme();

  const fetchSubmissions = useCallback(
    async (isRefresh = false) => {
      try {
        setError(null);

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const data = await api.submissions.getAll();

        if (!Array.isArray(data)) {
          throw new Error("Invalid submission response.");
        }

        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.savedAt ?? b.submissionTime).getTime() -
            new Date(a.savedAt ?? a.submissionTime).getTime()
        );

        setSubmissions(sorted);

        console.log(
          "[SUBMISSIONS] Records received:",
          sorted.length
        );
      } catch (err: any) {
        setError(
          err?.message || "Could not load submissions."
        );

        console.warn(
          "Could not load submissions from backend:",
          err
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      void fetchSubmissions();
    }, [fetchSubmissions])
  );

  const background = colors.background;
  const cardBackground = isDark ? "#1A1A1A" : "#FFFFFF";
  const primaryText = isDark ? "#FFFFFF" : "#171717";
  const secondaryText = isDark ? "#A3A3A3" : "#666666";
  const borderColor = isDark ? "#292929" : "#E5E7EB";
  const purple = "#8B5CF6";

  const gradedCount = submissions.filter(
    (item) => item.score != null
  ).length;

  const pendingCount = submissions.filter(item => item.status === "DRAFT").length;
  const submittedCount = submissions.filter(item => item.status === "SUBMITTED" || item.status === "GRADING" || item.status === "GRADED").length;

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void fetchSubmissions(true)}
            tintColor={purple}
            colors={[purple]}
          />
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={purple}
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text
              style={[
                styles.title,
                { color: primaryText },
              ]}
            >
              My Submissions
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: secondaryText },
              ]}
            >
              Track your submitted coursework and
              assessments.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => void fetchSubmissions(true)}
            disabled={loading || refreshing}
          >
            <Ionicons
              name="refresh-outline"
              size={23}
              color={purple}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator
              size="large"
              color={purple}
            />

            <Text
              style={[
                styles.subtitle,
                { color: secondaryText },
              ]}
            >
              Loading submissions...
            </Text>
          </View>
        ) : error ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: cardBackground,
                borderColor,
              },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={42}
              color="#EF4444"
            />

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: primaryText,
                  marginTop: 15,
                },
              ]}
            >
              Unable to load submissions
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                { color: secondaryText },
              ]}
            >
              {error}
            </Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => void fetchSubmissions()}
            >
              <Text style={styles.actionButtonText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* OVERVIEW */}

            <Text
              style={[
                styles.sectionTitle,
                { color: primaryText },
              ]}
            >
              Submission Overview
            </Text>

            <View style={styles.statsRow}>
              {[
                {
                  label: "Submitted",
                  value: submittedCount,
                  color: purple,
                },
                {
                  label: "Graded",
                  value: gradedCount,
                  color: "#22C55E",
                },
                {
                  label: "Drafts",
                  value: pendingCount,
                  color: "#F59E0B",
                },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statValue,
                      { color: stat.color },
                    ]}
                  >
                    {stat.value}
                  </Text>

                  <Text
                    style={[
                      styles.statLabel,
                      { color: secondaryText },
                    ]}
                  >
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* SUBMISSION HISTORY */}

            <Text
              style={[
                styles.sectionTitle,
                { color: primaryText },
              ]}
            >
              Submission History
            </Text>

            {submissions.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: cardBackground,
                    borderColor,
                  },
                ]}
              >
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="file-tray-outline"
                    size={38}
                    color={purple}
                  />
                </View>

                <Text
                  style={[
                    styles.emptyTitle,
                    { color: primaryText },
                  ]}
                >
                  No submissions yet
                </Text>

                <Text
                  style={[
                    styles.emptyDescription,
                    { color: secondaryText },
                  ]}
                >
                  Complete a coding challenge or assessment
                  to view your submission history here.
                </Text>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push("/coursework")}
                >
                  <Ionicons
                    name="book-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.actionButtonText}>
                    View Coursework
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              submissions.map((item) => {
                const graded = item.status === "GRADED";
                const isDraft = item.status === "DRAFT";

                const expanded =
                  expandedId === item.submissionId;

                const statusColor = graded
                  ? "#22C55E"
                  : "#F59E0B";

                return (
                  <View
                    key={item.submissionId}
                    style={[
                      styles.submissionCard,
                      {
                        backgroundColor: cardBackground,
                        borderColor,
                      },
                    ]}
                  >
                    <View style={styles.submissionHeader}>
                      <View style={styles.submissionIcon}>
                        <Ionicons
                          name="code-slash-outline"
                          size={24}
                          color={purple}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.submissionTitle,
                            { color: primaryText },
                          ]}
                        >
                          {item.assessment?.title ||
                            `Submission #${item.submissionId}`}
                        </Text>

                        <Text
                          style={[
                            styles.subtitle,
                            { color: secondaryText },
                          ]}
                        >
                          {item.assessment?.programLang ||
                            "Coding Assessment"}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              statusColor + "20",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: statusColor },
                          ]}
                        >
                          {item.status ?? "Unknown"}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.details,
                        { borderColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: secondaryText },
                        ]}
                      >
                        Submission ID
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          { color: primaryText },
                        ]}
                      >
                        #{item.submissionId}
                      </Text>

                      <Text
                        style={[
                          styles.detailLabel,
                          { color: secondaryText },
                        ]}
                      >
                        {isDraft ? "Saved on" : "Submitted on"}
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          { color: primaryText },
                        ]}
                      >
                        {formatDate((isDraft ? item.savedAt : item.submittedAt) ?? item.submissionTime)}
                      </Text>

                      <Text
                        style={[
                          styles.detailLabel,
                          { color: secondaryText },
                        ]}
                      >
                        Assessment Score
                      </Text>

                      <Text
                        style={[
                          styles.score,
                          { color: statusColor },
                        ]}
                      >
                        {graded
                          ? `${item.score}%`
                          : isDraft ? "Not submitted" : "Awaiting grading"}
                      </Text>
                    </View>

                    {item.assessment?.assessmentID && <TouchableOpacity style={styles.actionButton} onPress={() => router.push({ pathname: "/assessment-details", params: { assessmentId: String(item.assessment!.assessmentID), submissionId: String(item.submissionId) } })}><Text style={styles.actionButtonText}>{isDraft ? "Resume Draft" : "View Assessment"}</Text></TouchableOpacity>}
                    <TouchableOpacity
                      style={styles.codeButton}
                      onPress={() =>
                        setExpandedId(
                          expanded
                            ? null
                            : item.submissionId
                        )
                      }
                    >
                      <Ionicons
                        name="code-outline"
                        size={19}
                        color={purple}
                      />

                      <Text style={styles.codeButtonText}>
                        {expanded
                          ? "Hide Submitted Code"
                          : "View Submitted Code"}
                      </Text>

                      <Ionicons
                        name={
                          expanded
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={18}
                        color={purple}
                      />
                    </TouchableOpacity>

                    {expanded && (
                      <View style={styles.codeContainer}>
                        <ScrollView horizontal>
                          <Text
                            selectable
                            style={styles.codeText}
                          >
                            {item.sourceCode ||
                              "No source code available."}
                          </Text>
                        </ScrollView>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark
                ? "#211A30"
                : "#F3EEFF",
            },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={purple}
          />

          <Text
            style={[
              styles.infoText,
              {
                color: isDark ? "#DDD6FE" : "#5B21B6",
              },
            ]}
          >
            Submission records and assessment scores are
            retrieved directly from the DevMate backend.
            Pull down to refresh your submission history.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 45,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 30,
  },

  backButton: {
    width: 38,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
  },

  centerState: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 7,
    alignItems: "center",
  },

  statValue: {
    fontSize: 26,
    fontWeight: "bold",
  },

  statLabel: {
    fontSize: 12,
    marginTop: 6,
  },

  emptyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#2D2140",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 22,
    textAlign: "center",
  },

  actionButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 11,
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  submissionCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
  },

  submissionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  submissionIcon: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: "#8B5CF620",
    justifyContent: "center",
    alignItems: "center",
  },

  submissionTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  details: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
  },

  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
  },

  score: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
  },

  codeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#8B5CF615",
    borderRadius: 10,
    padding: 12,
  },

  codeButtonText: {
    color: "#8B5CF6",
    fontSize: 13,
    fontWeight: "600",
  },

  codeContainer: {
    backgroundColor: "#0F0B1E",
    borderRadius: 10,
    padding: 15,
    marginTop: 12,
  },

  codeText: {
    color: "#DDD6FE",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 20,
  },

  infoCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 20,
  },
});
