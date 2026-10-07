// DevMate Student Learn Screen

import { router } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LearnScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Learn</Text>
            <Text style={styles.subtitle}>
              Continue building your programming skills.
            </Text>
          </View>
        </View>

        {/* ================= CONTINUE LEARNING ================= */}

        <Text style={styles.sectionTitle}>Continue Learning</Text>

        <TouchableOpacity style={styles.featuredCourse}>
          <View style={styles.courseHeader}>
            <View style={styles.courseLevel}>
              <Text style={styles.levelText}>IN PROGRESS</Text>
            </View>

            <Text style={styles.percentage}>70%</Text>
          </View>

          <Text style={styles.courseTitle}>
            Basics of Python Programming
          </Text>

          <Text style={styles.courseDescription}>
            Learn the fundamentals of Python and build your programming
            foundation.
          </Text>

          <View style={styles.progressBackground}>
            <View style={[styles.progressBar, { width: "70%" }]} />
          </View>

          <Text style={styles.progressText}>70% completed</Text>
        </TouchableOpacity>

        {/* ================= YOUR COURSES ================= */}

        <Text style={styles.sectionTitle}>Your Courses</Text>

        {/* Python Course */}

        <TouchableOpacity style={styles.courseCard}>
          <View style={styles.courseInfo}>
            <View style={styles.courseIcon}>
              <Text style={styles.courseIconText}>Py</Text>
            </View>

            <View style={styles.courseDetails}>
              <Text style={styles.cardTitle}>
                Python Programming
              </Text>

              <Text style={styles.cardSubtitle}>
                Programming Fundamentals
              </Text>

              <View style={styles.smallProgressBackground}>
                <View
                  style={[
                    styles.smallProgressBar,
                    { width: "70%" },
                  ]}
                />
              </View>

              <Text style={styles.smallProgressText}>
                70% complete
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Web Development Course */}

        <TouchableOpacity style={styles.courseCard}>
          <View style={styles.courseInfo}>
            <View style={styles.courseIcon}>
              <Text style={styles.courseIconText}>{"</>"}</Text>
            </View>

            <View style={styles.courseDetails}>
              <Text style={styles.cardTitle}>
                Introduction to Web Design
              </Text>

              <Text style={styles.cardSubtitle}>
                Web Development
              </Text>

              <View style={styles.smallProgressBackground}>
                <View
                  style={[
                    styles.smallProgressBar,
                    { width: "45%" },
                  ]}
                />
              </View>

              <Text style={styles.smallProgressText}>
                45% complete
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ================= EXPLORE ================= */}

        <Text style={styles.sectionTitle}>Explore</Text>

        <TouchableOpacity style={styles.exploreCard}>
          <View>
            <Text style={styles.exploreLevel}>NEXT STEP</Text>

            <Text style={styles.exploreTitle}>
              Intermediate Programming
            </Text>

            <Text style={styles.exploreDescription}>
              Continue your learning journey with more advanced programming
              concepts.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
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

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.activeNavIcon}>▤</Text>
          <Text style={styles.activeNavText}>Learn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>⚙</Text>
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>○</Text>
          <Text style={styles.navText}>Account</Text>
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
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#A3A3A3",
    fontSize: 14,
    marginTop: 5,
  },

  // SECTION TITLE

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 10,
  },

  // FEATURED COURSE

  featuredCourse: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 18,
    marginBottom: 25,
  },

  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  courseLevel: {
    backgroundColor: "#2D2140",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  levelText: {
    color: "#A78BFA",
    fontSize: 10,
    fontWeight: "bold",
  },

  percentage: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "bold",
  },

  courseTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  courseDescription: {
    color: "#A3A3A3",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 15,
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

  progressText: {
    color: "#888888",
    fontSize: 11,
    marginTop: 7,
  },

  // COURSE CARDS

  courseCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  courseInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#2D2140",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  courseIconText: {
    color: "#A78BFA",
    fontSize: 16,
    fontWeight: "bold",
  },

  courseDetails: {
    flex: 1,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  cardSubtitle: {
    color: "#888888",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
  },

  smallProgressBackground: {
    height: 5,
    backgroundColor: "#333333",
    borderRadius: 3,
    overflow: "hidden",
  },

  smallProgressBar: {
    height: 5,
    backgroundColor: "#8B5CF6",
    borderRadius: 3,
  },

  smallProgressText: {
    color: "#777777",
    fontSize: 10,
    marginTop: 5,
  },

  // EXPLORE

  exploreCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  exploreLevel: {
    color: "#8B5CF6",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 7,
  },

  exploreTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  exploreDescription: {
    color: "#888888",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
    maxWidth: 280,
  },

  arrow: {
    color: "#8B5CF6",
    fontSize: 30,
    marginLeft: 10,
  },

  // BOTTOM NAVIGATION

  bottomNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: "#151515",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#292929",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  navIcon: {
    color: "#777777",
    fontSize: 20,
    marginBottom: 3,
  },

  navText: {
    color: "#777777",
    fontSize: 11,
  },

  activeNavIcon: {
    color: "#8B5CF6",
    fontSize: 22,
    marginBottom: 3,
  },

  activeNavText: {
    color: "#8B5CF6",
    fontSize: 11,
    fontWeight: "bold",
  },
});