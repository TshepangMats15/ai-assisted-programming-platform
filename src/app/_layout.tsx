import React from "react";
import { Stack } from "expo-router";

import {
  ActivityIndicator,
  View,
  Text,
  Button,
} from "react-native";

import {
  ThemeProvider,
  useAppTheme,
} from "../context/ThemeContext";

import {
  AuthProvider,
  useAuth,
} from "../context/AuthContext";

function AppNavigator() {
  const { colors } = useAppTheme();

  const {
    status,
    profile,
    error,
    retry,
    logout,
  } = useAuth();

  if (status === "loading" || status === "error") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          backgroundColor: colors.background,
        }}
      >
        {status === "loading" ? (
          <ActivityIndicator
            color="#8B5CF6"
            size="large"
          />
        ) : (
          <>
            <Text
              style={{
                color: "#8B5CF6",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              {error}
            </Text>

            <Button
              title="Retry"
              onPress={() => void retry()}
            />

            <Button
              title="Sign out"
              onPress={() => void logout()}
            />
          </>
        )}
      </View>
    );
  }

  const student =
    status === "ready" &&
    profile?.role === "STUDENT";

  const admin =
    status === "ready" &&
    profile?.role === "ADMIN";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {/* APPLICATION ENTRY POINT */}
      {/* Always available for role-based redirection */}

      <Stack.Screen name="index" />

      {/* PUBLIC ROUTES */}

      <Stack.Protected guard={status === "guest"}>
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
      </Stack.Protected>

      {/* STUDENT ROUTES */}

      <Stack.Protected guard={student}>
        <Stack.Screen name="(student)" />

        <Stack.Screen name="dashboard" />
        <Stack.Screen name="learn" />
        <Stack.Screen name="settings" />

        <Stack.Screen name="client/clienthome" />
        <Stack.Screen name="client/help" />
        <Stack.Screen name="client/learn" />
        <Stack.Screen name="client/notification" />
        <Stack.Screen name="client/profile" />
        <Stack.Screen name="client/settings" />

        <Stack.Screen name="coursework" />
        <Stack.Screen name="assessments" />
        <Stack.Screen name="assessment-details" />
        <Stack.Screen name="coding-workspace" />
        <Stack.Screen name="submission" />
        <Stack.Screen name="ai-assistance" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="projects" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="notifications" />
      </Stack.Protected>

      {/* ADMINISTRATOR ROUTES */}

      <Stack.Protected guard={admin}>
        <Stack.Screen name="admin" />
        <Stack.Screen name="club-admin" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}