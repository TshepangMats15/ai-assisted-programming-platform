
// DevMate Student Submissions Screen

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import api, { SubmissionRecord } from "../constants/api";

export default function SubmissionScreen() {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Get the current DevMate theme
  const { isDark, colors } = useAppTheme();

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        setLoading(true);
        const data = await api.submissions.getAll();
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("Could not load submissions from backend:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, []);

  // Theme colours
  const background = colors.background;
  const cardBackground = isDark ? "#1A1A1A" : "#FFFFFF";
  const primaryText = isDark ? "#FFFFFF" : "#171717";
  const secondaryText = isDark ? "#A3A3A3" : "#666666";
  const borderColor = isDark ? "#292929" : "#E5E7EB";
  const purple = "#8B5CF6";

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
              Track your submitted coursework and assessments.
            </Text>
          </View>
        </View>

        {/* OVERVIEW */}
        <Text
          style={[
            styles.sectionTitle,
            { color: primaryText },
          ]}
        >
          Submission Overview
        </Text>

        <View
          style={[
            styles.overviewCard,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
        >
          <View style={styles.overviewIcon}>
            <Ionicons
              name="document-text-outline"
              size={25}
              color={purple}
            />
          </View>

          <View style={styles.overviewText}>
            <Text
              style={[
                styles.overviewTitle,
                { color: primaryText },
              ]}
            >
              Submission records unavailable
            </Text>

            <Text
              style={[
                styles.overviewDescription,
                { color: secondaryText },
              ]}
            >
              Your submission history will appear here
              when DevMate is connected to the learning
              system.
            </Text>
          </View>
        </View>

        {/* SUBMISSIONS */}
        <Text
          style={[
            styles.sectionTitle,
            { color: primaryText },
          ]}
        >
          Submission History
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
            No submissions to display
          </Text>

          <Text
            style={[
              styles.emptyDescription,
              { color: secondaryText },
            ]}
          >
            Your submitted assignments, assessments,
            grading status and lecturer feedback will
            be shown here once submission data is
            available.
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

        {/* INFORMATION */}
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
                color: isDark
                  ? "#DDD6FE"
                  : "#5B21B6",
              },
            ]}
          >
            Submission tracking requires the DevMate
            backend. No submission records, grades or
            feedback are being simulated.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 45,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 30,
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
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
    marginTop: 6,
  },

  // SECTIONS
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
  },

  // OVERVIEW
  overviewCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  overviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2D2140",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  overviewText: {
    flex: 1,
  },

  overviewTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },

  overviewDescription: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },

  // EMPTY STATE
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

  // INFORMATION
  infoCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 20,
  },
});
