
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";

// Notification data structure
type NotificationItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
};

// Demo notifications
const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Welcome to DevMate!",
    message:
      "Welcome to your AI-assisted programming learning platform.",
    time: "Today",
    read: false,
    icon: "👋",
  },
  {
    id: 2,
    title: "Course Progress",
    message:
      "Keep learning and track your programming progress.",
    time: "Today",
    read: false,
    icon: "📚",
  },
  {
    id: 3,
    title: "Assessment Reminder",
    message:
      "Remember to check your available programming assessments.",
    time: "Yesterday",
    read: false,
    icon: "📝",
  },
  {
    id: 4,
    title: "AI Assistance",
    message:
      "Need help understanding code? Visit your AI assistance workspace.",
    time: "Earlier",
    read: true,
    icon: "🤖",
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  // Count notifications that have not been read
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Mark one notification as read
  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  // Remove all notifications
  const clearAllNotifications = () => {
    Alert.alert(
      "Clear Notifications",
      "Are you sure you want to clear all notifications?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => setNotifications([]),
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

          <Text style={styles.headerTitle}>
            Notifications
          </Text>

          <Text style={styles.subtitle}>
            Stay updated with your DevMate activities.
          </Text>
        </View>

        {/* Unread Count */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryTitle}>
              Your Notifications
            </Text>
            <Text style={styles.summarySubtitle}>
              {unreadCount} unread notification
              {unreadCount === 1 ? "" : "s"}
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {unreadCount}
            </Text>
          </View>
        </View>

        {/* Notification Actions */}
        {notifications.length > 0 && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Text
                style={[
                  styles.actionText,
                  unreadCount === 0 && styles.disabledText,
                ]}
              >
                Mark All as Read
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={clearAllNotifications}>
              <Text style={styles.clearText}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>
              No Notifications
            </Text>
            <Text style={styles.emptyMessage}>
              You're all caught up! New notifications
              will appear here.
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard,
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              <View style={styles.notificationRow}>
                <View style={styles.iconContainer}>
                  <Text style={styles.notificationIcon}>
                    {notification.icon}
                  </Text>
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>

                    {!notification.read && (
                      <View style={styles.unreadDot} />
                    )}
                  </View>

                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>

                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>

                  {!notification.read && (
                    <Text style={styles.tapHint}>
                      Tap to mark as read
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.footer}>
          DevMate Notifications
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
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  summarySubtitle: {
    fontSize: 14,
    color: "#DBEAFE",
    marginTop: 6,
  },
  countBadge: {
    backgroundColor: "#FFFFFF",
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563EB",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  actionText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledText: {
    color: "#9CA3AF",
  },
  clearText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  unreadCard: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  notificationRow: {
    flexDirection: "row",
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },
  notificationIcon: {
    fontSize: 22,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#2563EB",
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 7,
    lineHeight: 21,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 10,
  },
  tapHint: {
    fontSize: 12,
    color: "#2563EB",
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 35,
    borderRadius: 18,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 45,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#111827",
  },
  emptyMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 21,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 25,
  },
});
