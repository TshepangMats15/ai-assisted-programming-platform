
import React from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../context/ThemeContext";

type CourseworkItem = {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  status: "Not Started" | "In Progress" | "Completed";
};

// Real coursework will be loaded from the backend.
// No demonstration assignments are displayed.
const coursework: CourseworkItem[] = [];

export default function CourseworkScreen() {
  const { colors, isDark } = useAppTheme();

  const purple = "#8B5CF6";
  const purpleText = isDark ? "#A78BFA" : "#6D28D9";

  const total = coursework.length;

  const inProgress = coursework.filter(
    (item) => item.status === "In Progress"
  ).length;

  const completed = coursework.filter(
    (item) => item.status === "Completed"
  ).length;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
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
            { color: colors.text },
          ]}
        >
          My Coursework
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: colors.textSecondary },
          ]}
        >
          View your assignments and programming activities.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* COURSEWORK OVERVIEW */}
        <View
          style={[
            styles.overviewCard,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Text
            style={[
              styles.overviewTitle,
              { color: colors.text },
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
                  { color: colors.textSecondary },
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
                  { color: colors.textSecondary },
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
                  { color: colors.textSecondary },
                ]}
              >
                Completed
              </Text>
            </View>
          </View>
        </View>

        {/* ASSIGNMENTS */}
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          Your Assignments
        </Text>

        {coursework.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
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
                styles.emptyTitle,
                { color: colors.text },
              ]}
            >
              No assignments available
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                { color: colors.textSecondary },
              ]}
            >
              Your assignments will appear here once
              coursework is available.
            </Text>
          </View>
        ) : (
          coursework.map((item) => (
            <View
              key={item.id}
              style={[
                styles.courseworkCard,
                {
                  backgroundColor: colors.backgroundElement,
                },
              ]}
            >
              <View style={styles.cardTop}>
                <Text
                  style={[
                    styles.courseName,
                    { color: purpleText },
                  ]}
                >
                  {item.course}
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
                      { color: purpleText },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.assignmentTitle,
                  { color: colors.text },
                ]}
              >
                {item.title}
              </Text>

              <Text
                style={[
                  styles.dueDate,
                  { color: colors.textSecondary },
                ]}
              >
                {item.dueDate}
              </Text>

              <TouchableOpacity
                style={styles.viewButton}
                onPress={() =>
                  router.push({
                    pathname: "/assessments",
                    params: {
                      courseworkId: String(item.id),
                    },
                  })
                }
              >
                <Text style={styles.viewButtonText}>
                  View Assessments
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
              { color: colors.textSecondary },
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
              { color: colors.textSecondary },
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
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    marginBottom: 10,
  },

  dueDate: {
    fontSize: 12,
    marginBottom: 18,
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

  emptyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    marginTop: 8,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 14,
    textAlign: "center",
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
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
