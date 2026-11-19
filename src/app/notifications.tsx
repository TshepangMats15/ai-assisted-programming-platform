import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../context/ThemeContext";
import { api } from "../constants/api";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
};

export default function NotificationsScreen() {
  const { isDark, colors } = useAppTheme();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const background = colors.background;
  const cardBackground = isDark ? "#1A1A1A" : "#FFFFFF";
  const primaryText = isDark ? "#FFFFFF" : "#171717";
  const secondaryText = isDark ? "#A3A3A3" : "#666666";
  const borderColor = isDark ? "#292929" : "#E5E7EB";
  const purple = "#8B5CF6";

  // Convert backend date into readable text.
  const formatDate = (value?: string | null) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  // Retrieve real announcements from Spring Boot.
  const loadNotifications = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        console.log("[Notifications] Loading announcements");

        const data = await api.announcements.getAll();

        if (!Array.isArray(data)) {
          throw new Error(
            "Invalid announcements response."
          );
        }

        const mapped: NotificationItem[] = data
          .filter((item) => item.id != null)
          .sort((a, b) => {
            const dateA =
              new Date(a.createdAt || "").getTime() || 0;

            const dateB =
              new Date(b.createdAt || "").getTime() || 0;

            return dateB - dateA;
          })
          .map((item) => ({
            id: String(item.id),
            title: item.title || "Announcement",
            message: item.message || "",
            time: formatDate(item.createdAt),
          }));

        setNotifications(mapped);

        console.log(
          "[Notifications] Announcements received:",
          mapped.length
        );

      } catch (err: any) {
        console.warn(
          "[Notifications Error]",
          err?.message
        );

        setError(
          err?.message ||
            "Unable to retrieve announcements."
        );

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // Reload whenever the student opens this screen.
  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications])
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadNotifications(true)}
            tintColor={purple}
            colors={[purple]}
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ‹ Back
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.headerTitle,
              { color: primaryText },
            ]}
          >
            Notifications
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: secondaryText },
            ]}
          >
            Stay updated with your DevMate announcements.
          </Text>
        </View>

        {/* SUMMARY */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: cardBackground,
              borderColor,
            },
          ]}
        >
          <View>
            <Text
              style={[
                styles.summaryTitle,
                { color: primaryText },
              ]}
            >
              Your Announcements
            </Text>

            <Text
              style={[
                styles.summarySubtitle,
                { color: secondaryText },
              ]}
            >
              {notifications.length} announcement
              {notifications.length === 1 ? "" : "s"}
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {notifications.length}
            </Text>
          </View>
        </View>

        {/* REFRESH */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadNotifications(true)}
          disabled={loading || refreshing}
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color={purple}
          />

          <Text style={styles.refreshText}>
            Refresh Announcements
          </Text>
        </TouchableOpacity>

        {/* LOADING */}
        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator
              size="large"
              color={purple}
            />

            <Text
              style={[
                styles.emptyMessage,
                { color: secondaryText },
              ]}
            >
              Loading announcements...
            </Text>
          </View>
        )}

        {/* ERROR */}
        {!loading && !!error && (
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color="#EF4444"
            />

            <Text style={styles.errorTitle}>
              Unable to load announcements
            </Text>

            <Text style={styles.errorMessage}>
              {error}
            </Text>

            <TouchableOpacity
              onPress={() => loadNotifications()}
            >
              <Text style={styles.refreshText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* EMPTY STATE */}
        {!loading &&
          !error &&
          notifications.length === 0 && (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: cardBackground,
                  borderColor,
                },
              ]}
            >
              <Ionicons
                name="notifications-off-outline"
                size={40}
                color={purple}
              />

              <Text
                style={[
                  styles.emptyTitle,
                  { color: primaryText },
                ]}
              >
                No Announcements
              </Text>

              <Text
                style={[
                  styles.emptyMessage,
                  { color: secondaryText },
                ]}
              >
                Admin announcements will appear here
                when they are published.
              </Text>
            </View>
          )}

        {/* REAL ADMIN ANNOUNCEMENTS */}
        {!loading &&
          notifications.map((notification) => (
            <View
              key={notification.id}
              style={[
                styles.notificationCard,
                {
                  backgroundColor: cardBackground,
                  borderColor,
                },
              ]}
            >
              <View style={styles.notificationRow}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="megaphone-outline"
                    size={20}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.notificationContent}>
                  <Text style={styles.adminLabel}>
                    ADMIN ANNOUNCEMENT
                  </Text>

                  <Text
                    style={[
                      styles.notificationTitle,
                      { color: primaryText },
                    ]}
                  >
                    {notification.title}
                  </Text>

                  <Text
                    style={[
                      styles.notificationMessage,
                      { color: secondaryText },
                    ]}
                  >
                    {notification.message}
                  </Text>

                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                </View>
              </View>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 20,
  },

  backButton: {
    marginBottom: 10,
  },

  backText: {
    fontSize: 16,
    color: "#8B5CF6",
    fontWeight: "600",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  summaryCard: {
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  summarySubtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  countBadge: {
    backgroundColor: "#8B5CF6",
    minWidth: 36,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  countText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
    padding: 10,
  },

  refreshText: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "600",
  },

  loadingCard: {
    padding: 35,
    alignItems: "center",
    gap: 10,
  },

  emptyCard: {
    padding: 30,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
  },

  emptyMessage: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  errorCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EF4444",
    marginBottom: 16,
    gap: 10,
  },

  errorTitle: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  errorMessage: {
    color: "#EF4444",
    fontSize: 12,
    textAlign: "center",
  },

  notificationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },

  notificationRow: {
    flexDirection: "row",
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  notificationContent: {
    flex: 1,
  },

  adminLabel: {
    color: "#8B5CF6",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 7,
  },

  notificationTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },

  notificationMessage: {
    fontSize: 13,
    marginTop: 5,
    lineHeight: 18,
  },

  notificationTime: {
    fontSize: 11,
    color: "#888888",
    marginTop: 8,
  },
});