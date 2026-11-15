import React, { useCallback, useEffect, useState } from "react";
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
import { router } from "expo-router";

import { auth } from "../services/firebase";
import api, { CourseworkDTO, ResultRecord } from "../constants/api";

type CourseProgress = {
  courseID: string;
  name: string;
  progress: number;
};

export default function ProgressScreen() {
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [totalCompletedTasks, setTotalCompletedTasks] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProgressData = useCallback(async () => {
    try {
      const currentUid = auth.currentUser?.uid;

      // 1. Fetch real coursework created by the admin and the student's results
      const [allCoursework, userResults] = await Promise.all([
        api.coursework.getAll().catch(() => [] as CourseworkDTO[]),
        currentUid
          ? api.results.getUserResults(currentUid).catch(() => [] as ResultRecord[])
          : Promise.resolve([] as ResultRecord[]),
      ]);

      const completedAssessmentIds = new Set(
        userResults
          .map((r) => r.assessmentId)
          .filter((id): id is number => id != null)
      );

      // 2. Calculate progress for each admin-created course
      const calculatedCourses: CourseProgress[] = allCoursework.map((course) => {
        let totalAssessments = 0;
        let completedAssessments = 0;

        if (course.preAssessment?.assessmentID) {
          totalAssessments += 1;
          if (completedAssessmentIds.has(course.preAssessment.assessmentID)) {
            completedAssessments += 1;
          }
        }

        if (course.postAssessment?.assessmentID) {
          totalAssessments += 1;
          if (completedAssessmentIds.has(course.postAssessment.assessmentID)) {
            completedAssessments += 1;
          }
        }

        const percentage =
          totalAssessments > 0
            ? Math.round((completedAssessments / totalAssessments) * 100)
            : 0;

        return {
          courseID: course.courseID,
          name: course.title || "Untitled Course",
          progress: percentage,
        };
      });

      setCourses(calculatedCourses);
      setTotalCompletedTasks(userResults.length);

      if (calculatedCourses.length > 0) {
        const sum = calculatedCourses.reduce((acc, curr) => acc + curr.progress, 0);
        setOverallProgress(Math.round(sum / calculatedCourses.length));
      } else {
        setOverallProgress(0);
      }
    } catch (err) {
      console.warn("[Progress] Failed to load progress data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProgressData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
            colors={["#8B5CF6"]}
          />
        }
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Progress</Text>
        <Text style={styles.subtitle}>
          Track your learning journey and achievements.
        </Text>

        {/* ================= OVERVIEW ================= */}

        <Text style={styles.sectionTitle}>Learning Overview</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {loading && !refreshing ? "..." : courses.length}
            </Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {loading && !refreshing ? "..." : totalCompletedTasks}
            </Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {loading && !refreshing ? "..." : `${overallProgress}%`}
            </Text>
            <Text style={styles.statLabel}>Overall</Text>
          </View>
        </View>

        {/* ================= COURSE PROGRESS ================= */}

        <Text style={styles.sectionTitle}>Course Progress</Text>

        {loading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color="#8B5CF6"
            style={{ marginVertical: 20 }}
          />
        ) : courses.length === 0 ? (
          <View style={styles.courseCard}>
            <Text style={[styles.courseName, { color: "#A3A3A3" }]}>
              No courses created yet by admin.
            </Text>
          </View>
        ) : (
          courses.map((course) => (
            <View key={course.courseID} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <Text style={styles.courseName}>{course.name}</Text>
                <Text style={styles.percentage}>{course.progress}%</Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${course.progress}%` },
                  ]}
                />
              </View>
            </View>
          ))
        )}

        {/* ================= ACHIEVEMENTS ================= */}

        <Text style={styles.sectionTitle}>Achievements</Text>

        <View style={styles.achievementCard}>
          <Text style={styles.achievementIcon}>★</Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>Getting Started</Text>
            <Text style={styles.achievementDescription}>
              {courses.length > 0
                ? "Enrolled in active platform coursework."
                : "Awaiting course enrollment."}
            </Text>
          </View>
        </View>

        <View style={styles.achievementCard}>
          <Text style={styles.achievementIcon}>★</Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>Assessment Master</Text>
            <Text style={styles.achievementDescription}>
              {totalCompletedTasks > 0
                ? `Completed ${totalCompletedTasks} assessment exercise${totalCompletedTasks === 1 ? "" : "s"}.`
                : "Complete your first assessment to unlock this badge."}
            </Text>
          </View>
        </View>

        <Text style={styles.demoText}>
          Pull down to refresh live progress metrics.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles for the Progress screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  backText: {
    color: "#8B5CF6",
    fontSize: 16,
    marginBottom: 25,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#A3A3A3",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingVertical: 22,
    alignItems: "center",
  },
  statNumber: {
    color: "#8B5CF6",
    fontSize: 23,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#A3A3A3",
    fontSize: 11,
    marginTop: 7,
  },
  courseCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 10,
  },
  courseName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
  },
  percentage: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "bold",
  },
  progressBackground: {
    height: 7,
    backgroundColor: "#333333",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: 7,
    backgroundColor: "#8B5CF6",
    borderRadius: 4,
  },
  achievementCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 17,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  achievementIcon: {
    color: "#A78BFA",
    fontSize: 28,
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  achievementDescription: {
    color: "#888888",
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },
  demoText: {
    color: "#777777",
    fontSize: 12,
    marginTop: 15,
    textAlign: "center",
  },
});