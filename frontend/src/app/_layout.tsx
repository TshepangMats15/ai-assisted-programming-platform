
import React from "react";
import { Stack } from "expo-router";

import {
  ThemeProvider,
  useAppTheme,
} from "../context/ThemeContext";

// Main navigation uses the selected app theme
function AppNavigator() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {/* Authentication Screens */}
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />

      {/* Student Bottom Tabs */}
      <Stack.Screen name="(student)" />

      {/* Member 2 Client Screens */}
      <Stack.Screen name="client/clienthome" />
      <Stack.Screen name="client/help" />
      <Stack.Screen name="client/notification" />
      <Stack.Screen name="client/profile" />
      <Stack.Screen name="client/settings" />

      {/* Coursework and Assessment Screens */}
      <Stack.Screen name="coursework" />
      <Stack.Screen name="assessments" />
      <Stack.Screen name="assessment-details" />
      <Stack.Screen name="coding-workspace" />
      <Stack.Screen name="submission" />

      {/* AI and Learning Screens */}
      <Stack.Screen name="ai-assistance" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="projects" />
      <Stack.Screen name="explore" />

      {/* Notifications */}
      <Stack.Screen name="notifications" />
    </Stack>
  );
}

// Wrap the application in the theme provider
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
