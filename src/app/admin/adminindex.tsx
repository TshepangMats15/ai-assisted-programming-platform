
import React from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  background: "#0D0D0D",
  card: "#1A1A1A",
  purple: "#8B5CF6",
  lightPurple: "#A78BFA",
  purpleBackground: "#2D2140",
  white: "#FFFFFF",
  secondary: "#A3A3A3",
  muted: "#777777",
  border: "#292929",
};

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type AdminRoute =
  | "/admin/courses"
  | "/admin/students"
  | "/admin/ai-usage"
  | "/admin/announcements"
  | "/admin/results"
  | "/admin/reports";

type AdminMenuItem = {
  title: string;
  subtitle: string;
  icon: IconName;
  route: AdminRoute;
};

const managementItems: AdminMenuItem[] = [
  {
    title: "Course Management",
    subtitle: "Add and manage learning courses",
    icon: "book-outline",
    route: "/admin/courses",
  },
  {
    title: "Students",
    subtitle: "View and manage students",
    icon: "people-outline",
    route: "/admin/students",
  },
  {
    title: "AI Usage",
    subtitle: "Monitor AI assistance activity",
    icon: "hardware-chip-outline",
    route: "/admin/ai-usage",
  },
  {
    title: "Announcements",
    subtitle: "View and manage announcements",
    icon: "megaphone-outline",
    route: "/admin/announcements",
  },
  {
    title: "Results",
    subtitle: "Review assessment results",
    icon: "document-text-outline",
    route: "/admin/results",
  },
  {
    title: "Reports",
    subtitle: "View reports and analytics",
    icon: "bar-chart-outline",
    route: "/admin/reports",
  },
];

export default function AdminDashboard() {
  function openScreen(route: AdminRoute) {
    router.push(route);
  }

  function openSettings() {
    Alert.alert(
      "Admin Settings",
      "The Admin Settings screen has not been connected yet."
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}>
              <Ionicons
                name="code-slash"
                size={24}
                color={COLORS.white}
              />
            </View>

            <View>
              <Text style={styles.brandName}>DevMate</Text>
              <Text style={styles.brandSubtitle}>
                Admin Portal
              </Text>
            </View>
          </View>

          <View style={styles.adminBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={COLORS.lightPurple}
            />
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Dashboard</Text>
          <Text style={styles.welcomeSubtitle}>
            Welcome back! Manage your DevMate learning
            community from one place.
          </Text>
        </View>

        {/* Overview */}
        <Text style={styles.sectionTitle}>
          Platform Overview
        </Text>

        <View style={styles.overviewGrid}>
          <OverviewCard
            title="Courses"
            icon="book-outline"
            onPress={() => openScreen("/admin/courses")}
          />

          <OverviewCard
            title="Students"
            icon="people-outline"
            onPress={() => openScreen("/admin/students")}
          />

          <OverviewCard
            title="Results"
            icon="school-outline"
            onPress={() => openScreen("/admin/results")}
          />

          <OverviewCard
            title="AI Usage"
            icon="hardware-chip-outline"
            onPress={() => openScreen("/admin/ai-usage")}
          />

          <OverviewCard
            title="Reports"
            icon="stats-chart-outline"
            onPress={() => openScreen("/admin/reports")}
          />
        </View>

        {/* Management */}
        <Text style={styles.sectionTitle}>Management</Text>

        <View style={styles.menuContainer}>
          {managementItems.map((item, index) => (
            <React.Fragment key={item.route}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => openScreen(item.route)}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                activeOpacity={0.75}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={COLORS.lightPurple}
                  />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>
                    {item.title}
                  </Text>
                  <Text style={styles.menuSubtitle}>
                    {item.subtitle}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.muted}
                />
              </TouchableOpacity>

              {index < managementItems.length - 1 && (
                <View style={styles.menuDivider} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Quick action */}
        <Text style={styles.sectionTitle}>
          Course Administration
        </Text>

        <View style={styles.courseCard}>
          <View style={styles.courseIconBox}>
            <Ionicons
              name="add-circle-outline"
              size={32}
              color={COLORS.lightPurple}
            />
          </View>

          <Text style={styles.performanceTitle}>
            Create a New Course
          </Text>

          <Text style={styles.performanceDescription}>
            Prepare new learning content for DevMate
            students.
          </Text>

          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => openScreen("/admin/courses")}
          >
            <Ionicons
              name="add"
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.reportButtonText}>
              Add Course
            </Text>
          </TouchableOpacity>
        </View>

        {/* Performance */}
        <Text style={styles.sectionTitle}>
          Student Performance
        </Text>

        <View style={styles.performanceCard}>
          <View style={styles.courseIconBox}>
            <Ionicons
              name="bar-chart-outline"
              size={28}
              color={COLORS.lightPurple}
            />
          </View>

          <Text style={styles.performanceTitle}>
            Performance Analytics
          </Text>

          <Text style={styles.performanceDescription}>
            Student performance statistics will appear
            here once real analytics data is connected.
          </Text>

          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => openScreen("/admin/reports")}
          >
            <Text style={styles.reportButtonText}>
              View Reports
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity
          style={styles.settingsCard}
          onPress={openSettings}
        >
          <View style={styles.menuIconBox}>
            <Ionicons
              name="settings-outline"
              size={22}
              color={COLORS.lightPurple}
            />
          </View>

          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>
              Admin Settings
            </Text>
            <Text style={styles.menuSubtitle}>
              Admin preferences and configuration
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.muted}
          />
        </TouchableOpacity>

        <Text style={styles.footerText}>
          DevMate • Admin Dashboard
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function OverviewCard({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: IconName;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.overviewCard}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.overviewIconBox}>
        <Ionicons
          name={icon}
          size={23}
          color={COLORS.lightPurple}
        />
      </View>

      <Text style={styles.overviewTitle}>{title}</Text>

      <View style={styles.overviewFooter}>
        <Text style={styles.overviewLink}>
          View Details
        </Text>
        <Ionicons
          name="arrow-forward"
          size={15}
          color={COLORS.purple}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 45,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 30,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoBox: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  brandName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  brandSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.purpleBackground,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
  },
  adminBadgeText: {
    color: COLORS.lightPurple,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },
  welcomeSection: {
    marginBottom: 28,
  },
  welcomeTitle: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  overviewCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 14,
    minHeight: 155,
  },
  overviewIconBox: {
    width: 43,
    height: 43,
    borderRadius: 10,
    backgroundColor: COLORS.purpleBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  overviewTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 12,
  },
  overviewFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  overviewLink: {
    color: COLORS.purple,
    fontSize: 12,
    fontWeight: "600",
    marginRight: 7,
  },
  menuContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 28,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  menuIconBox: {
    width: 43,
    height: 43,
    backgroundColor: COLORS.purpleBackground,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  menuSubtitle: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  courseCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 28,
  },
  courseIconBox: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.purpleBackground,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  performanceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 28,
  },
  performanceTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 9,
    textAlign: "center",
  },
  performanceDescription: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 18,
  },
  reportButton: {
    backgroundColor: COLORS.purple,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  reportButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "bold",
  },
  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
  },
});
