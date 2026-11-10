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

import { useAppTheme } from "../context/ThemeContext";
import api, { CourseworkDTO } from "../constants/api";

export default function CourseworkScreen() {
  const { colors, isDark } = useAppTheme();

  const purple = "#8B5CF6";
  const purpleText = isDark ? "#A78BFA" : "#6D28D9";

  const [coursework, setCoursework] = useState<CourseworkDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =======================================================
  // LOAD COURSEWORK
  // =======================================================

  const loadCoursework = useCallback(async () => {
    try {
      setError(null);

      const data = await api.coursework.getAll();

      setCoursework(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("[Coursework] Failed to load coursework:", err);

      setError(
        err?.message ||
          "Unable to load coursework. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoursework();
  }, [loadCoursework]);

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadCoursework();
    } finally {
      setRefreshing(false);
    }
  }, [loadCoursework]);

  // =======================================================
  // RETRY
  // =======================================================

  const handleRetry = async () => {
    setLoading(true);
    await loadCoursework();
  };

  // =======================================================
  // DATE FORMATTING
  // =======================================================

  const formatDueDate = (
    dueDate?: string | null
  ): string => {
    if (!dueDate) {
      return "No due date";
    }

    const parsedDate = new Date(dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return dueDate;
    }

    return `Due ${parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}`;
  };

  // =======================================================
  // COURSE COUNTS
  // =======================================================

  const total = coursework.length;

  /*
   * Student progress tracking has not been implemented
   * in the backend yet.
   *
   * Do not fabricate "In Progress" or "Completed" values.
   */
  const inProgress = 0;
  const completed = 0;

  // =======================================================
  // NAVIGATION
  // =======================================================

  const openCoursework = (item: CourseworkDTO) => {
    router.push({
      pathname: "/assessments",
      params: {
        courseworkId: item.courseID,
      },
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={purple}
          />

          <Text style={styles.backText}>
            Back
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          My Coursework
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          View your assignments and programming activities.
        </Text>
      </View>

      {/* CONTENT */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={purple}
            colors={[purple]}
          />
        }
      >
        {/* COURSEWORK OVERVIEW */}

        <View
          style={[
            styles.overviewCard,
            {
              backgroundColor: colors.backgroundElement,
            },
          ]}
        >
          <Text
            style={[
              styles.overviewTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Coursework Overview
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {total}
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                Total
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {inProgress}
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                In Progress
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {completed}
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                Completed
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION TITLE */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Your Assignments
        </Text>

        {/* INITIAL LOADING */}

        {loading && !refreshing ? (
          <View
            style={[
              styles.stateCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <ActivityIndicator
              size="large"
              color={purple}
            />

            <Text
              style={[
                styles.stateTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Loading coursework
            </Text>

            <Text
              style={[
                styles.stateDescription,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Retrieving your coursework from DevMate.
            </Text>
          </View>
        ) : error ? (
          /* ERROR STATE */

          <View
            style={[
              styles.stateCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={42}
              color={purple}
            />

            <Text
              style={[
                styles.stateTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Unable to load coursework
            </Text>

            <Text
              style={[
                styles.stateDescription,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.retryButtonText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : coursework.length === 0 ? (
          /* REAL EMPTY STATE */

          <View
            style={[
              styles.stateCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={42}
              color={purple}
            />

            <Text
              style={[
                styles.stateTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              No assignments available
            </Text>

            <Text
              style={[
                styles.stateDescription,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Your assignments will appear here once coursework
              is available.
            </Text>
          </View>
        ) : (
          /* REAL COURSEWORK */

          coursework.map((item) => (
            <View
              key={item.courseID}
              style={[
                styles.courseworkCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.cardTop}>
                <Text
                  style={[
                    styles.courseName,
                    {
                      color: purpleText,
                    },
                  ]}
                >
                  {item.module || "Coursework"}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isDark
                        ? "#2D2140"
                        : "#EDE9FE",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: purpleText,
                      },
                    ]}
                  >
                    AVAILABLE
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.assignmentTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {item.title}
              </Text>

              {item.description ? (
                <Text
                  numberOfLines={3}
                  style={[
                    styles.description,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.metadataRow}>
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={colors.textSecondary}
                />

                <Text
                  style={[
                    styles.dueDate,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {formatDueDate(item.dueDate)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => openCoursework(item)}
              >
                <Text style={styles.viewButtonText}>
                  View Course
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* BOTTOM NAVIGATION */}

      <View
        style={[
          styles.bottomNavigation,
          {
            backgroundColor: colors.backgroundElement,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/dashboard")}
        >
          <Ionicons
            name="home-outline"
            size={22}
            color={colors.textSecondary}
          />

          <Text
            style={[
              styles.navText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/learn")}
        >
          <Ionicons
            name="book-outline"
            size={22}
            color={colors.textSecondary}
          />

          <Text
            style={[
              styles.navText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Learn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="document-text"
            size={22}
            color={purple}
          />

          <Text style={styles.activeNavText}>
            Coursework
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 3,
  },

  backText: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "600",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 5,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },

  overviewCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },

  overviewTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statItem: {
    alignItems: "center",
    flex: 1,
  },

  statNumber: {
    color: "#8B5CF6",
    fontSize: 24,
    fontWeight: "bold",
  },

  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  courseworkCard: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },

  courseName: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },

  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },

  assignmentTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },

  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
  },

  dueDate: {
    fontSize: 12,
  },

  viewButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 8,
    padding: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  stateCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    marginTop: 8,
  },

  stateTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 14,
    textAlign: "center",
  },

  stateDescription: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  retryButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },

  bottomNavigation: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    gap: 5,
  },

  navText: {
    fontSize: 11,
  },

  activeNavText: {
    color: "#8B5CF6",
    fontSize: 11,
    fontWeight: "bold",
  },
});
