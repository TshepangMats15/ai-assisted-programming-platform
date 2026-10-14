
// Main navigation layout for the ITDMA app

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#0D0D0D",
        },
      }}
    >
      {/* Authentication Screens */}
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />

      {/* Student Main Screens */}
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="learn" />
      <Stack.Screen name="coursework" />

      {/* Assessment Screens */}
      <Stack.Screen name="assessments" />
      <Stack.Screen name="assessment-details" />
      <Stack.Screen name="coding-workspace" />
      <Stack.Screen name="submission" />

      {/* AI and Learning Screens */}
      <Stack.Screen name="ai-assistance" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="projects" />

      {/* Student Account Screens */}
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}