
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
};

type Result = {
  id: string;
  student: string;
  course: string;
  assessment: string;
  score: number | null;
  grade: string | null;
};

function parseScore(value: unknown): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

export default function AdminResultsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCourse, setActiveCourse] = useState("All");
  const [results, setResults] = useState<Result[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const loadResults = useCallback(async () => {
    try {
      setErrorMessage("");

      // Use the existing Spring Boot API method.
      const data = await api.results.getAll();

      if (!Array.isArray(data)) {
        setResults([]);
        setErrorMessage(
          "The server returned an unexpected results format."
        );
        return;
      }

      const formatted: Result[] = data.map(
        (item: any, index: number) => {
          const studentName =
            typeof item.studentName === "string" &&
            item.studentName.trim() !== ""
              ? item.studentName
              : item.userId != null
              ? `Student #${item.userId}`
              : "Unknown Student";

          const course =
            typeof item.course === "string" &&
            item.course.trim() !== ""
              ? item.course
              : "Unspecified";

          const assessment =
            typeof item.assessmentTitle === "string" &&
            item.assessmentTitle.trim() !== ""
              ? item.assessmentTitle
              : item.assessmentId != null
              ? `Assessment #${item.assessmentId}`
              : "Unknown Assessment";

          const grade =
            typeof item.grade === "string" &&
            item.grade.trim() !== ""
              ? item.grade
              : null;

          return {
            id: String(
              item.resultId ??
                item.id ??
                `result-${index}`
            ),
            student: studentName,
            course,
            assessment,
            score: parseScore(item.score),
            grade,
          };
        }
      );

      setResults(formatted);
    } catch {
      setResults([]);
      setErrorMessage(
        "Could not load assessment results. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  function refreshResults() {
    setRefreshing(true);
    loadResults();
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/admin/adminindex");
    }
  }

  // Build filters from courses actually returned by the backend.
  const courseFilters = [
    "All",
    ...Array.from(
      new Set(
        results
          .map((item) => item.course)
          .filter((course) => course !== "Unspecified")
      )
    ),
  ];

  const filteredResults = results.filter(
    (result) =>
      activeCourse === "All" ||
      result.course === activeCourse
  );

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
            Assessment Results
          </Text>

          <Text style={styles.headerSubtitle}>
            DevMate Admin Portal
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshResults}
          disabled={isLoading || refreshing}
          accessibilityRole="button"
          accessibilityLabel="Refresh assessment results"
        >
          <Ionicons
            name="refresh"
            size={21}
            color={COLORS.lightPurple}
          />
        </TouchableOpacity>
      </View>

      {/* PAGE DESCRIPTION */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.pageDescription}>
          Review student assessment performance
          and submitted results.
        </Text>
      </View>

      {/* COURSE FILTERS */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {courseFilters.map((course) => (
            <TouchableOpacity
              key={course}
              style={[
                styles.filterPill,
                activeCourse === course &&
                  styles.filterPillActive,
              ]}
              onPress={() => setActiveCourse(course)}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.filterText,
                  activeCourse === course &&
                    styles.filterTextActive,
                ]}
              >
                {course}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshResults}
            tintColor={COLORS.purple}
            colors={[COLORS.purple]}
          />
        }
      >
        {/* ERROR MESSAGE */}
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

        {/* RESULTS SUMMARY */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="school-outline"
              size={24}
              color={COLORS.lightPurple}
            />
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>
              Assessment Results
            </Text>

            <Text style={styles.summaryValue}>
              {isLoading
                ? "Loading..."
                : errorMessage !== ""
                ? "Unavailable"
                : String(filteredResults.length)}
            </Text>

            <Text style={styles.summaryNote}>
              {activeCourse === "All"
                ? "All available courses"
                : activeCourse}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Student Results
        </Text>

        {/* RESULTS TABLE */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderRow}>
            <Text
              style={[
                styles.columnHeader,
                styles.colStudent,
              ]}
            >
              Student
            </Text>

            <Text
              style={[
                styles.columnHeader,
                styles.colAssessment,
              ]}
            >
              Assessment
            </Text>

            <Text
              style={[
                styles.columnHeader,
                styles.colScore,
              ]}
            >
              Score
            </Text>

            <Text
              style={[
                styles.columnHeader,
                styles.colGrade,
              ]}
            >
              Grade
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={COLORS.purple}
              />

              <Text style={styles.loadingText}>
                Loading assessment results...
              </Text>
            </View>
          ) : filteredResults.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={30}
                  color={COLORS.lightPurple}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No results available
              </Text>

              <Text style={styles.emptyText}>
                {errorMessage !== ""
                  ? "Assessment results could not be retrieved."
                  : activeCourse === "All"
                  ? "No assessment results have been returned by the backend."
                  : `No results were found for ${activeCourse}.`}
              </Text>
            </View>
          ) : (
            filteredResults.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  index < filteredResults.length - 1 &&
                    styles.rowBorder,
                ]}
              >
                {/* STUDENT */}
                <View style={styles.colStudent}>
                  <Text
                    style={styles.studentName}
                    numberOfLines={2}
                  >
                    {item.student}
                  </Text>

                  <Text
                    style={styles.studentCourse}
                    numberOfLines={1}
                  >
                    {item.course}
                  </Text>
                </View>

                {/* ASSESSMENT */}
                <Text
                  style={[
                    styles.cellText,
                    styles.colAssessment,
                  ]}
                  numberOfLines={3}
                >
                  {item.assessment}
                </Text>

                {/* SCORE */}
                <Text
                  style={[
                    styles.scoreText,
                    styles.colScore,
                  ]}
                >
                  {item.score === null
                    ? "—"
                    : `${item.score}%`}
                </Text>

                {/* GRADE */}
                <View style={styles.colGrade}>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeText}>
                      {item.grade ?? "—"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <Text style={styles.footerText}>
          Results are displayed as returned by the backend.
          Grade thresholds are not calculated in this screen.
        </Text>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 18,
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
    fontSize: 22,
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
    justifyContent: "center",
    alignItems: "center",
  },

  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  pageDescription: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
  },

  filterContainer: {
    marginBottom: 20,
  },

  filterScroll: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },

  filterPill: {
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 17,
    borderRadius: 10,
    marginRight: 10,
  },

  filterPillActive: {
    backgroundColor: COLORS.purple,
  },

  filterText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: "600",
  },

  filterTextActive: {
    color: COLORS.white,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 45,
  },

  noticeCard: {
    backgroundColor: "#17131F",
    borderWidth: 1,
    borderColor: COLORS.purpleBackground,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  noticeText: {
    color: "#D8B4FE",
    fontSize: 12,
    lineHeight: 19,
    marginLeft: 10,
    flex: 1,
  },

  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.purpleBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  summaryContent: {
    flex: 1,
  },

  summaryLabel: {
    color: COLORS.secondary,
    fontSize: 12,
  },

  summaryValue: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 4,
  },

  summaryNote: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
  },

  tableCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
  },

  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  columnHeader: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "bold",
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  colStudent: {
    flex: 1.5,
    paddingRight: 7,
  },

  colAssessment: {
    flex: 1.3,
    paddingRight: 7,
  },

  colScore: {
    flex: 0.8,
    textAlign: "center",
  },

  colGrade: {
    flex: 0.7,
    alignItems: "flex-end",
  },

  cellText: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 17,
  },

  studentName: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },

  studentCourse: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },

  scoreText: {
    color: COLORS.lightPurple,
    fontSize: 12,
    fontWeight: "bold",
  },

  gradeBadge: {
    backgroundColor: COLORS.purpleBackground,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 8,
    alignItems: "center",
  },

  gradeText: {
    color: COLORS.lightPurple,
    fontSize: 11,
    fontWeight: "bold",
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },

  loadingText: {
    color: COLORS.secondary,
    fontSize: 13,
    marginTop: 13,
  },

  emptyContainer: {
    paddingVertical: 35,
    alignItems: "center",
  },

  emptyIcon: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.purpleBackground,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  emptyTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },

  emptyText: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    paddingHorizontal: 15,
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
  },
});
