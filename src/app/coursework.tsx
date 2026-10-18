// DevMate Student Coursework Screen

import { router } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Temporary coursework data for testing the frontend
const coursework = [
  {
    id: 1,
    title: "Python Variables and Data Types",
    course: "Python Programming",
    dueDate: "Due date to be confirmed",
    status: "Not Started",
  },
  {
    id: 2,
    title: "Conditional Statements",
    course: "Python Programming",
    dueDate: "Due date to be confirmed",
    status: "In Progress",
  },
  {
    id: 3,
    title: "HTML and CSS Basics",
    course: "Introduction to Web Design",
    dueDate: "Due date to be confirmed",
    status: "Not Started",
  },
];

export default function CourseworkScreen() {
  return (
    <SafeAreaView style={styles.container}>

      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Coursework</Text>

        <Text style={styles.subtitle}>
          View your assignments and programming activities.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ================= OVERVIEW ================= */}

        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>
            Coursework Overview
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* ================= COURSEWORK LIST ================= */}

        <Text style={styles.sectionTitle}>
          Your Assignments
        </Text>

        {coursework.map((item) => (
          <View key={item.id} style={styles.courseworkCard}>

            <View style={styles.cardTop}>
              <Text style={styles.courseName}>
                {item.course}
              </Text>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={styles.assignmentTitle}>
              {item.title}
            </Text>

            <Text style={styles.dueDate}>
              {item.dueDate}
            </Text>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() =>
                router.push({
                  pathname: "/assessments",
                  params: { courseworkId: String(item.id) },
                })
              }
            >
              <Text style={styles.viewButtonText}>
                View Assessments →
              </Text>
            </TouchableOpacity>

          </View>
        ))}

      </ScrollView>

      {/* ================= BOTTOM NAVIGATION ================= */}

      <View style={styles.bottomNavigation}>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/dashboard")}
        >
          <Text style={styles.navIcon}>⌂</Text>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/learn")}
        >
          <Text style={styles.navIcon}>▤</Text>
          <Text style={styles.navText}>Learn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.activeNavIcon}>▣</Text>
          <Text style={styles.activeNavText}>Coursework</Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },

  backButton: {
    marginBottom: 20,
  },

  backText: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "600",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#A3A3A3",
    fontSize: 14,
    marginTop: 5,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },

  overviewCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },

  overviewTitle: {
    color: "#FFFFFF",
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
    color: "#A3A3A3",
    fontSize: 12,
    marginTop: 5,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  courseworkCard: {
    backgroundColor: "#1A1A1A",
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
    color: "#A78BFA",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },

  statusBadge: {
    backgroundColor: "#2D2140",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  statusText: {
    color: "#A78BFA",
    fontSize: 10,
    fontWeight: "bold",
  },

  assignmentTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
  },

  dueDate: {
    color: "#888888",
    fontSize: 12,
    marginBottom: 18,
  },

  viewButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 8,
    padding: 13,
    alignItems: "center",
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  // ================= BOTTOM NAVIGATION STYLES =================

  bottomNavigation: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderTopWidth: 1,
    borderTopColor: "#333333",
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
  },

  navIcon: {
    color: "#888888",
    fontSize: 23,
    marginBottom: 5,
  },

  navText: {
    color: "#888888",
    fontSize: 11,
  },

  activeNavIcon: {
    color: "#8B5CF6",
    fontSize: 23,
    marginBottom: 5,
  },

  activeNavText: {
    color: "#A78BFA",
    fontSize: 11,
    fontWeight: "bold",
  },
});