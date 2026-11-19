
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "../../services/firebase";
import { setAuthToken as setServicesAuthToken } from "../../services/api";
import { setAuthToken as setConstantsAuthToken } from "../../constants/api";
import { useAppTheme } from "../../context/ThemeContext";

export default function AdminSettingsPage() {
  const { isDark, colors, toggleTheme } = useAppTheme();
  const [loggingOut, setLoggingOut] = useState(false);

  const user = auth.currentUser;

  const background = colors.background;
  const cardBackground = colors.backgroundElement;
  const primaryText = isDark ? "#F5F7FA" : "#1A1A1A";
  const secondaryText = isDark ? "#A0A0A0" : "#667085";
  const borderColor = isDark ? "#303030" : "#E5E7EB";

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/admin/adminindex");
    }
  };

  const performLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await signOut(auth);

      // Clear both API clients used by the login screen.
      setServicesAuthToken(null);
      setConstantsAuthToken(null);

      // Return to src/app/index.tsx (the login screen).
      router.replace("/");
    } catch (error: any) {
      Alert.alert(
        "Logout Failed",
        error?.message || "Unable to log out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of DevMate?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: performLogout,
        },
      ]
    );
  };

  const SettingRow = ({
    icon,
    title,
    subtitle,
    onPress,
    rightContent,
    danger = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightContent?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: borderColor }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      accessibilityRole={onPress ? "button" : undefined}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: danger
              ? isDark
                ? "#402020"
                : "#FEECEC"
              : isDark
              ? "#29243B"
              : "#F0EAFF",
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={danger ? "#EF4444" : "#8B5CF6"}
        />
      </View>

      <View style={styles.settingInfo}>
        <Text
          style={[
            styles.settingTitle,
            { color: danger ? "#EF4444" : primaryText },
          ]}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text style={[styles.settingSubtitle, { color: secondaryText }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightContent ??
        (onPress ? (
          <Ionicons
            name="chevron-forward"
            size={19}
            color={secondaryText}
          />
        ) : null)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: cardBackground,
            borderBottomColor: borderColor,
          },
        ]}
      >
        <TouchableOpacity
          onPress={goBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={primaryText} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: primaryText }]}>
          Admin Settings
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ADMIN PROFILE */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#FFFFFF" />
          </View>

          <Text style={[styles.profileName, { color: primaryText }]}>
            {user?.displayName || "Administrator"}
          </Text>

          <Text style={[styles.profileEmail, { color: secondaryText }]}>
            {user?.email || "No email available"}
          </Text>

          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#8B5CF6" />
            <Text style={styles.roleText}>Admin Account</Text>
          </View>
        </View>

        {/* APPEARANCE */}
        <Text style={[styles.sectionTitle, { color: secondaryText }]}>
          APPEARANCE
        </Text>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: cardBackground, borderColor },
          ]}
        >
          <SettingRow     
            icon={isDark ? "moon-outline" : "sunny-outline"}
            title="Dark Mode"
            subtitle="Change the appearance of DevMate"
            rightContent={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: "#D1D5DB", true: "#A78BFA" }}
                thumbColor={isDark ? "#8B5CF6" : "#FFFFFF"}
                accessibilityLabel="Toggle dark mode"
              />
            }
          />
        </View>

        {/* ACCOUNT */}
        <Text style={[styles.sectionTitle, { color: secondaryText }]}>
          ACCOUNT
        </Text>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: cardBackground, borderColor },
          ]}
        >
          <SettingRow
            icon="mail-outline"
            title="Email Address"
            subtitle={user?.email || "Not available"}
          />

          <SettingRow
            icon="shield-checkmark-outline"
            title="Account Type"
            subtitle="Administrator"
          />

          <SettingRow
            icon="checkmark-circle-outline"
            title="Email Verification"
            subtitle={
              user?.emailVerified
                ? "Verified email address"
                : "Email not verified"
            }
          />
        </View>

        {/* APPLICATION INFORMATION */}
        <Text style={[styles.sectionTitle, { color: secondaryText }]}>
          APPLICATION
        </Text>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: cardBackground, borderColor },
          ]}
        >
          <SettingRow
            icon="code-slash-outline"
            title="Application"
            subtitle="DevMate — AI-Assisted Programming Platform"
          />

          <SettingRow
            icon="information-circle-outline"
            title="About DevMate"
            subtitle="Learning and administration platform"
          />
        </View>

        {/* SESSION */}
        <Text style={[styles.sectionTitle, { color: secondaryText }]}>
          SESSION
        </Text>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: cardBackground, borderColor },
          ]}
        >
          <SettingRow
            icon="log-out-outline"
            title={loggingOut ? "Logging Out..." : "Log Out"}
            subtitle="Sign out of your administrator account"
            onPress={loggingOut ? undefined : confirmLogout}
            danger
            rightContent={
              loggingOut ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#EF4444"
                />
              )
            }
          />
        </View>

        <Text style={[styles.footer, { color: secondaryText }]}>
          DevMate Administration
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 24,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 45,
  },
  profileCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileName: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    textAlign: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0EAFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 14,
  },
  roleText: {
    color: "#7C3AED",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 24,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
});
