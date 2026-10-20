import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const sections = [
  {
    title: "Student Performance",
    icon: "trending-up-outline" as const,
    description: "Student averages and progress trends will appear here.",
  },
  {
    title: "Pass and Fail Rates",
    icon: "pie-chart-outline" as const,
    description: "Pass rates will be calculated from assessment results.",
  },
  {
    title: "Programming Languages",
    icon: "code-slash-outline" as const,
    description: "Compare performance across different programming languages.",
  },
  {
    title: "Assessment Completion",
    icon: "checkmark-circle-outline" as const,
    description: "Track completed and outstanding assessments.",
  },
];

export default function ClubAdminAnalyticsScreen() {
  const [period, setPeriod] = useState("30 Days");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/club-admin")}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Monitor coding club performance and student progress.
        </Text>

        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#C4B5FD"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>Awaiting Real Data</Text>
            <Text style={styles.noticeText}>
              Analytics will become available after backend integration.
              No student statistics are currently loaded.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Reporting Period</Text>

        <View style={styles.periodRow}>
          {["7 Days", "30 Days", "All Time"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.periodButton,
                period === item && styles.activeButton,
              ]}
              onPress={() => setPeriod(item)}
            >
              <Text style={styles.buttonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>

        <View style={styles.grid}>
          {[
            "Total Students",
            "Assessments",
            "Average Score",
            "Completion Rate",
          ].map((item) => (
            <View key={item} style={styles.metricCard}>
              <Text style={styles.metricValue}>--</Text>
              <Text style={styles.metricLabel}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Detailed Analytics</Text>

        {sections.map((section) => (
          <View key={section.title} style={styles.analyticsCard}>
            <View style={styles.cardHeading}>
              <Ionicons
                name={section.icon}
                size={22}
                color="#A78BFA"
              />
              <Text style={styles.cardTitle}>{section.title}</Text>
            </View>

            <View style={styles.emptyArea}>
              <Ionicons
                name="bar-chart-outline"
                size={35}
                color="#666666"
              />
              <Text style={styles.emptyTitle}>No Data Available</Text>
              <Text style={styles.emptyText}>
                {section.description}
              </Text>
            </View>
          </View>
        ))}

        <Text style={styles.footer}>
          Reporting period selection is a frontend preview.
          Actual filtering will work once analytics data is connected.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 20,
  },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold" },
  content: { padding: 20, paddingTop: 0, paddingBottom: 40 },
  subtitle: { color: "#AAAAAA", fontSize: 14, marginBottom: 20 },
  notice: {
    backgroundColor: "#261B37",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  noticeTitle: {
    color: "#E9D5FF",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 7,
  },
  noticeText: { color: "#C4B5D4", fontSize: 12, lineHeight: 19 },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 14,
  },
  periodRow: { flexDirection: "row", gap: 9, marginBottom: 25 },
  periodButton: {
    backgroundColor: "#292929",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 9,
  },
  activeButton: { backgroundColor: "#8B5CF6" },
  buttonText: { color: "#FFFFFF", fontSize: 12 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#211832",
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "bold",
  },
  metricLabel: { color: "#BBBBBB", fontSize: 12, marginTop: 9 },
  analyticsCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 13,
    padding: 18,
    marginBottom: 14,
  },
  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  emptyArea: { alignItems: "center", paddingVertical: 28 },
  emptyTitle: {
    color: "#CCCCCC",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 12,
  },
  emptyText: {
    color: "#999999",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 9,
  },
  footer: {
    color: "#888888",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 10,
  },
});