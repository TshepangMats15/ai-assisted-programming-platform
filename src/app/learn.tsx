// DevMate Student Learn Screen

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

export default function LearnScreen() {
  const { colors, isDark } = useAppTheme();

  const purple = "#8B5CF6";
  const purpleText = isDark ? "#A78BFA" : "#6D28D9";

  const [courses, setCourses] = useState<CourseworkDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =======================================================
  // LOAD COURSES
  // =======================================================

  const loadCourses = useCallback(async () => {
    try {
      setError(null);

      const data = await api.coursework.getAll();

      setCourses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("[Learn] Failed to load coursework:", err);

      setError(
        err?.message ||
          "Unable to load courses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadCourses();
    } finally {
      setRefreshing(false);
    }
  }, [loadCourses]);

  // =======================================================
  // RETRY
  // =======================================================

  const handleRetry = async () => {
    setLoading(true);
    await loadCourses();
  };

  // =======================================================
  // COURSE ICON
  // =======================================================

  const getCourseIconText = (course: CourseworkDTO) => {
    const source = course.module || course.title;

    const words = source
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      return "C";
    }

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  };

  // =======================================================
  // OPEN COURSE
  // =======================================================

  const openCourse = (course: CourseworkDTO) => {
    router.push({
      pathname: "/assessments",
      params: {
        courseID: course.courseID,
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
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Learn
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Continue building your programming skills.
          </Text>
        </View>

        {/* ================= YOUR COURSES ================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Your Courses
        </Text>

        {/* ================= LOADING ================= */}

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
              Loading courses
            </Text>

            <Text
              style={[
                styles.stateDescription,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Retrieving available coursework from DevMate.
            </Text>
          </View>
        ) : error ? (
          /* ================= ERROR ================= */

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
              Unable to load courses
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
        ) : courses.length === 0 ? (
          /* ================= EMPTY ================= */

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
              name="book-outline"
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
              No courses available
            </Text>

            <Text
              style={[
                styles.stateDescription,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Courses created by your administrator will appear
              here.
            </Text>
          </View>
        ) : (
          /* ================= REAL COURSES ================= */

          courses.map((course) => (
            <TouchableOpacity
              key={course.courseID}
              style={[
                styles.courseCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => openCourse(course)}
            >
              <View style={styles.courseInfo}>
                <View
                  style={[
                    styles.courseIcon,
                    {
                      backgroundColor: isDark
                        ? "#2D2140"
                        : "#EDE9FE",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.courseIconText,
                      {
                        color: purpleText,
                      },
                    ]}
                  >
                    {getCourseIconText(course)}
                  </Text>
                </View>

                <View style={styles.courseDetails}>
                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {course.title}
                  </Text>

                  <Text
                    style={[
                      styles.cardSubtitle,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {course.module || "Coursework"}
                  </Text>

                  {course.description ? (
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.cardDescription,
                        {
                          color: colors.textSecondary,
                        },
                      ]}
                    >
                      {course.description}
                    </Text>
                  ) : null}

                  <View style={styles.courseMeta}>
                    <View
                      style={[
                        styles.availableBadge,
                        {
                          backgroundColor: isDark
                            ? "#2D2140"
                            : "#EDE9FE",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.availableText,
                          {
                            color: purpleText,
                          },
                        ]}
                      >
                        AVAILABLE
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={19}
                      color={purple}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* ================= COURSEWORK SHORTCUT ================= */}

        {!loading && !error && courses.length > 0 ? (
          <>
            <Text
              style={[
                styles.sectionTitle,
                styles.courseworkSectionTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Coursework
            </Text>

            <TouchableOpacity
              style={[
                styles.exploreCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/coursework")}
            >
              <View style={styles.exploreContent}>
                <Text
                  style={[
                    styles.exploreLevel,
                    {
                      color: purpleText,
                    },
                  ]}
                >
                  VIEW ALL
                </Text>

                <Text
                  style={[
                    styles.exploreTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  My Coursework
                </Text>

                <Text
                  style={[
                    styles.exploreDescription,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  View all available coursework, assessments,
                  and learning activities.
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={24}
                color={purple}
              />
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>

      {/* ================= BOTTOM NAVIGATION ================= */}

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

        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="book"
            size={22}
            color={purple}
          />

          <Text style={styles.activeNavText}>
            Learn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/settings")}
        >
          <Ionicons
            name="settings-outline"
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
            Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/profile")}
        >
          <Ionicons
            name="person-outline"
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
            Account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },

  // HEADER

  header: {
    marginTop: 15,
    marginBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 5,
  },

  // SECTION TITLE

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 10,
  },

  courseworkSectionTitle: {
    marginTop: 28,
  },

  // COURSE CARDS

  courseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },

  courseInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  courseIconText: {
    fontSize: 15,
    fontWeight: "bold",
  },

  courseDetails: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },

  cardSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },

  cardDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  courseMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  availableBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  availableText: {
    fontSize: 9,
    fontWeight: "bold",
  },

  // STATES

  stateCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    marginTop: 5,
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

  // COURSEWORK SHORTCUT

  exploreCard: {
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
  },

  exploreContent: {
    flex: 1,
    paddingRight: 12,
  },

  exploreLevel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 7,
  },

  exploreTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  exploreDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },

  // BOTTOM NAVIGATION

  bottomNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
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
