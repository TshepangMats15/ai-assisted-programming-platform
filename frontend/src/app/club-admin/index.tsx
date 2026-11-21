import React from "react";
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

export default function ClubAdminDashboard() {
  const menuItems = [
    { title: "Manage Students", icon: "people-outline", route: "/club-admin/students" },
    { title: "Manage Coursework", icon: "book-outline", route: "/club-admin/coursework" },
    { title: "Manage Assessments", icon: "document-text-outline", route: "/club-admin/assessments" },
    { title: "Student Results", icon: "trophy-outline", route: "/club-admin/results" },
    { title: "Analytics", icon: "bar-chart-outline", route: "/club-admin/analytics" },
  ] as const;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Coding Club Admin</Text>
        <Text style={styles.subtitle}>
          Manage students, learning activities and performance.
        </Text>

        <View style={styles.card}>
          <Ionicons name="shield-checkmark-outline" size={32} color="#A78BFA" />
          <Text style={styles.cardTitle}>Administration Dashboard</Text>
          <Text style={styles.cardDescription}>
            Select a section below to manage your coding club.
          </Text>
        </View>

        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
          >
            <Ionicons name={item.icon} size={25} color="#A78BFA" />
            <Text style={styles.menuText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },
  content: { padding: 22, paddingTop: 35, paddingBottom: 50 },
  heading: { color: "#FFFFFF", fontSize: 27, fontWeight: "bold" },
  subtitle: { color: "#AAAAAA", fontSize: 14, marginTop: 9, marginBottom: 25 },
  card: {
    backgroundColor: "#211832",
    borderRadius: 16,
    padding: 22,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#45315F",
  },
  cardTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "bold", marginTop: 12 },
  cardDescription: { color: "#BBBBBB", fontSize: 13, marginTop: 8, lineHeight: 20 },
  menuItem: {
    backgroundColor: "#1A1A1A",
    borderRadius: 13,
    padding: 18,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    borderWidth: 1,
    borderColor: "#303030",
  },
  menuText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600", flex: 1 },
});
