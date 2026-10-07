// DevMate Student Home / Dashboard

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileLetter}>S</Text>
            </View>

            <View>
              <Text style={styles.greeting}>Hi, Student</Text>
              <Text style={styles.subGreeting}>
                Let's start learning...
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>●</Text>
          </TouchableOpacity>
        </View>


        {/* ================= ANNOUNCEMENTS ================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Announcements</Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.announcementCard}>
          <View style={styles.announcementTag}>
            <Text style={styles.tagText}>NEW</Text>
          </View>

          <Text style={styles.announcementTitle}>
            Welcome to DevMate
          </Text>

          <Text style={styles.announcementText}>
            Start learning programming, complete your coursework
            and improve your coding skills.
          </Text>
        </View>


        {/* ================= MY PROGRESS ================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Progress</Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>Details</Text>
          </TouchableOpacity>
        </View>


        {/* Python Course */}

        <View style={styles.courseCard}>
          <View style={styles.courseTop}>
            <View>
              <Text style={styles.courseTitle}>
                Basics of Python Programming
              </Text>

              <Text style={styles.courseLessons}>
                Programming Fundamentals
              </Text>
            </View>

            <Text style={styles.percentage}>70%</Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressBar,
                { width: "70%" },
              ]}
            />
          </View>
        </View>


        {/* Web Design Course */}

        <View style={styles.courseCard}>
          <View style={styles.courseTop}>
            <View>
              <Text style={styles.courseTitle}>
                Introduction to Web Design
              </Text>

              <Text style={styles.courseLessons}>
                Web Development
              </Text>
            </View>

            <Text style={styles.percentage}>45%</Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressBar,
                { width: "45%" },
              ]}
            />
          </View>
        </View>


        {/* ================= QUICK ACTIONS ================= */}

        <Text style={styles.quickTitle}>Quick Actions</Text>

        <View style={styles.quickActions}>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionSymbol}>+</Text>
            <Text style={styles.actionText}>New Project</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionSymbol}>{"</>"}</Text>
            <Text style={styles.actionText}>My Projects</Text>
          </TouchableOpacity>

        </View>

        <TouchableOpacity style={styles.aiButton}>
          <Text style={styles.aiButtonTitle}>
            AI Assistant
          </Text>

          <Text style={styles.aiButtonText}>
            Get help with your code
          </Text>
        </TouchableOpacity>

      </ScrollView>


      {/* ================= BOTTOM NAVIGATION ================= */}

      <View style={styles.bottomNavigation}>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.activeNavIcon}>⌂</Text>
          <Text style={styles.activeNavText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>▤</Text>
          <Text style={styles.navText}>Learn</Text>
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

    // One consistent background colour
    backgroundColor: "#0D0D0D",
  },


  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },


  // HEADER

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 30,
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  profileLetter: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  greeting: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  subGreeting: {
    color: "#A3A3A3",
    fontSize: 13,
    marginTop: 3,
  },

  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  notificationIcon: {
    color: "#8B5CF6",
    fontSize: 16,
  },


  // SECTION HEADERS

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 10,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  seeAll: {
    color: "#8B5CF6",
    fontSize: 13,
    fontWeight: "600",
  },


  // ANNOUNCEMENT

  announcementCard: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 12,
    marginBottom: 25,
  },

  announcementTag: {
    alignSelf: "flex-start",
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },

  tagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },

  announcementTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 6,
  },

  announcementText: {
    color: "#B3B3B3",
    fontSize: 14,
    lineHeight: 20,
  },


  // COURSE / PROGRESS CARDS

  courseCard: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  courseTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  courseTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  courseLessons: {
    color: "#888888",
    fontSize: 12,
    marginTop: 5,
  },

  percentage: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "bold",
  },

  progressBackground: {
    height: 6,
    backgroundColor: "#333333",
    borderRadius: 3,
    overflow: "hidden",
  },

  progressBar: {
    height: 6,
    backgroundColor: "#8B5CF6",
    borderRadius: 3,
  },


  // QUICK ACTIONS

  quickTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
  },

  quickActions: {
    flexDirection: "row",
    gap: 12,
  },

  actionButton: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },

  actionSymbol: {
    color: "#8B5CF6",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 7,
  },

  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },


  // AI BUTTON

  aiButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    padding: 18,
    marginTop: 12,
  },

  aiButtonTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },

  aiButtonText: {
    color: "#EDE9FE",
    fontSize: 13,
    marginTop: 3,
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