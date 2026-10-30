import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export default function NotificationsScreen() {
  const { isDark, colors } = useAppTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const background = colors.background;
  const cardBackground = isDark ? "#1A1A1A" : "#FFFFFF";
  const primaryText = isDark ? "#FFFFFF" : "#171717";
  const secondaryText = isDark ? "#A3A3A3" : "#666666";
  const borderColor = isDark ? "#292929" : "#E5E7EB";
  const purple = "#8B5CF6";

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    Alert.alert("Clear Notifications", "Are you sure you want to clear all?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: () => setNotifications([]) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: primaryText }]}>Notifications</Text>
          <Text style={[styles.subtitle, { color: secondaryText }]}>
            Stay updated with your DevMate announcements.
          </Text>
        </View>

        {/* Unread Count Card */}
        <View style={[styles.summaryCard, { backgroundColor: cardBackground, borderColor }]}>
          <View>
            <Text style={[styles.summaryTitle, { color: primaryText }]}>Your Notifications</Text>
            <Text style={[styles.summarySubtitle, { color: secondaryText }]}>
              {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>{unreadCount}</Text>
          </View>
        </View>

        {/* Actions */}
        {notifications.length > 0 && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={markAllAsRead} disabled={unreadCount === 0}>
              <Text style={[styles.actionText, unreadCount === 0 && styles.disabledText]}>
                Mark All as Read
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={clearAllNotifications}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List / Empty State */}
        {notifications.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBackground, borderColor }]}>
            <Ionicons name="notifications-off-outline" size={40} color={purple} />
            <Text style={[styles.emptyTitle, { color: primaryText }]}>No Notifications</Text>
            <Text style={[styles.emptyMessage, { color: secondaryText }]}>
              You're all caught up! Admin announcements and course updates will appear here.
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                { backgroundColor: cardBackground, borderColor },
                !notification.read && { borderColor: purple },
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              <View style={styles.notificationRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="megaphone-outline" size={20} color="#FFFFFF" />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.notificationTitle, { color: primaryText }]}>
                      {notification.title}
                    </Text>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={[styles.notificationMessage, { color: secondaryText }]}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  backButton: { marginBottom: 10 },
  backText: { fontSize: 16, color: "#8B5CF6", fontWeight: "600" },
  headerTitle: { fontSize: 28, fontWeight: "bold" },
  subtitle: { fontSize: 14, marginTop: 4 },
  summaryCard: {
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
  },
  summaryTitle: { fontSize: 16, fontWeight: "bold" },
  summarySubtitle: { fontSize: 13, marginTop: 4 },
  countBadge: {
    backgroundColor: "#8B5CF6",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  countText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  actionText: { color: "#8B5CF6", fontSize: 14, fontWeight: "600" },
  disabledText: { color: "#666666" },
  clearText: { color: "#EF4444", fontSize: 14, fontWeight: "600" },
  emptyCard: { padding: 30, borderRadius: 14, alignItems: "center", borderWidth: 1 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", marginTop: 12 },
  emptyMessage: { fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 18 },
  notificationCard: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  notificationRow: { flexDirection: "row" },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: { flex: 1 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  notificationTitle: { fontSize: 15, fontWeight: "bold", flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#8B5CF6", marginLeft: 6 },
  notificationMessage: { fontSize: 13, marginTop: 5, lineHeight: 18 },
  notificationTime: { fontSize: 11, color: "#888888", marginTop: 8 },
});