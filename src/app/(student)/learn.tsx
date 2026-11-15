
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

// Import the DevMate theme & API
import { useAppTheme } from "../../context/ThemeContext";
import api, { CourseworkDTO } from "../../constants/api";

export default function LearnScreen() {
  // Get the current light or dark theme
  const { isDark, colors } = useAppTheme();

  // Dynamic courses from backend
  const [courses, setCourses] = useState<CourseworkDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Colours that change with the theme
  const background = colors.background;
  const cardBackground = isDark ? "#1A1A1A" : "#FFFFFF";
  const primaryText = isDark ? "#FFFFFF" : "#171717";
  const secondaryText = isDark ? "#A3A3A3" : "#666666";
  const borderColor = isDark ? "#292929" : "#E5E7EB";
  const purple = "#8B5CF6";

  const loadCourses = useCallback(async () => {
    try {
      const data = await api.coursework.getAll();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load courses:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCourses();
  };

  return (
    <SafeAreaView
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
            onRefresh={onRefresh}
            tintColor={purple}
            colors={[purple]}
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: primaryText },
            ]}
          >
            Learn
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: secondaryText },
            ]}
          >
            Continue building your programming skills.
          </Text>
        </View>

        {/* CONTINUE LEARNING */}
        <Text
          style={[
            styles.sectionTitle,
            { color: primaryText },
          ]}
        >
          Continue Learning
        </Text>

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
            name="book-outline"
            size={30}
            color={purple}
          />

          <Text
            style={[
              styles.emptyTitle,
              { color: primaryText },
            ]}
          >
            No learning progress available
          </Text>

          <Text
            style={[
              styles.emptyDescription,
              { color: secondaryText },
            ]}
          >
            Your enrolled courses and learning progress
            will appear here once your student account
            is connected to the learning system.
          </Text>
        </View>

        {/* AVAILABLE COURSE CONTENT */}
        <Text
          style={[
            styles.sectionTitle,
            { color: primaryText },
          ]}
        >
          Programming Courses
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={purple}
            style={{ marginVertical: 25 }}
          />
        ) : courses.length === 0 ? (
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
              name="folder-open-outline"
              size={30}
              color={purple}
            />

            <Text
              style={[
                styles.emptyTitle,
                { color: primaryText },
              ]}
            >
              No courses available
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                { color: secondaryText },
              ]}
            >
              Courses created by your administrator will appear here.
            </Text>
          </View>
        ) : (
          courses.map((course) => (
            <TouchableOpacity
              key={course.courseID}
              style={[
                styles.courseCard,
                {
                  backgroundColor: cardBackground,
                  borderColor,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/assessments",
                  params: { courseID: course.courseID },
                })
              }
            >
              <View style={styles.courseInfo}>
                <View style={styles.courseIcon}>
                  <Ionicons
                    name="code-slash-outline"
                    size={25}
                    color="#A78BFA"
                  />
                </View>

                <View style={styles.courseDetails}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: primaryText },
                    ]}
                  >
                    {course.title}
                  </Text>

                  <Text
                    style={[
                      styles.cardSubtitle,
                      { color: secondaryText },
                    ]}
                  >
                    {course.module || "Programming Fundamentals"}
                  </Text>

                  <Text style={styles.courseAction}>
                    View coursework
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={purple}
                />
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* EXPLORE */}
        <Text
          style={[
            styles.sectionTitle,
            { color: primaryText },
          ]}
        >
          Explore
        </Text>

        <TouchableOpacity
          style={[
            styles.exploreCard,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
          onPress={() => router.push("/explore")}
        >
          <View style={styles.exploreContent}>
            <Text style={styles.exploreLevel}>
              EXPLORE MORE
            </Text>

            <Text
              style={[
                styles.exploreTitle,
                { color: primaryText },
              ]}
            >
              Intermediate Programming
            </Text>

            <Text
              style={[
                styles.exploreDescription,
                { color: secondaryText },
              ]}
            >
              Discover more advanced programming
              concepts and learning opportunities.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={purple}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 35,
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
    lineHeight: 21,
  },

  // SECTION TITLES
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 12,
  },

  // EMPTY LEARNING STATE
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 25,
    marginBottom: 25,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },

  // COURSE CARDS
  courseCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },

  courseInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  courseIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#2D2140",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
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
    marginTop: 5,
  },

  courseAction: {
    color: "#8B5CF6",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 9,
  },

  unavailableText: {
    fontSize: 11,
    marginTop: 9,
    fontStyle: "italic",
  },

  // EXPLORE
  exploreCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  exploreContent: {
    flex: 1,
  },

  exploreLevel: {
    color: "#8B5CF6",
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
    lineHeight: 18,
    marginTop: 6,
  },
});
