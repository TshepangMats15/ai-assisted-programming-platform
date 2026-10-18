
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../context/ThemeContext";

export default function StudentTabsLayout() {
  // Get the current theme
  const { isDark, colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // Active and inactive navigation colours
        tabBarActiveTintColor: "#8B5CF6",
        tabBarInactiveTintColor: isDark
          ? "#999999"
          : "#777777",

        // Navigation bar appearance
        tabBarStyle: {
          backgroundColor: isDark ? "#151515" : "#FFFFFF",
          borderTopColor: isDark ? "#292929" : "#E5E5E5",
          borderTopWidth: 1,
          height: 65,
          paddingTop: 6,
          paddingBottom: 8,
        },

        // Screen background
        sceneStyle: {
          backgroundColor: colors.background,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* LEARN */}
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="book-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="settings-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ACCOUNT */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
