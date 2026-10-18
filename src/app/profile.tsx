
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

// DevMate Student Profile Screen

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);

  // Get the currently signed-in Firebase user
  const user = auth.currentUser;

  const email = user?.email || "No email available";
  const name =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "DevMate Student";

  const initials = name.substring(0, 2).toUpperCase();

  // Log the student out of Firebase
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of DevMate?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await signOut(auth);
              router.replace("/" as any);
            } catch (error) {
              Alert.alert(
                "Logout Failed",
                "Unable to log out. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* Student Information */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.studentBadge}>
            <Text style={styles.studentBadgeText}>
              DevMate Student
            </Text>
          </View>
        </View>

        {/* Account Information */}
        <Text style={styles.sectionTitle}>
          Account Information
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Full Name</Text>
          <Text style={styles.infoValue}>{name}</Text>

          <View style={styles.divider} />

          <Text style={styles.infoLabel}>Email Address</Text>
          <Text style={styles.infoValue}>{email}</Text>

          <View style={styles.divider} />

          <Text style={styles.infoLabel}>Account Status</Text>
          <Text style={styles.activeStatus}>Active</Text>
        </View>

        {/* Navigation Connections */}
        <Text style={styles.sectionTitle}>
          My DevMate
        </Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/progress" as any)}
        >
          <Text style={styles.menuText}>
            📊 My Learning Progress
          </Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/notifications" as any)}
        >
          <Text style={styles.menuText}>
            🔔 Notifications
          </Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/settings" as any)}
        >
          <Text style={styles.menuText}>
            ⚙️ Settings
          </Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.logoutText}>
              Log Out
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>
          DevMate - AI-Assisted Programming Platform
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  content: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 25,
  },
  backButton: {
    fontSize: 18,
    color: "#2563EB",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
    elevation: 2,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
  },
  name: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#111827",
  },
  email: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
  },
  studentBadge: {
    marginTop: 15,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
  },
  studentBadgeText: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  activeStatus: {
    fontSize: 16,
    color: "#16A34A",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 15,
  },
  menuItem: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  arrow: {
    fontSize: 24,
    color: "#9CA3AF",
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    padding: 17,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 25,
  },
});
