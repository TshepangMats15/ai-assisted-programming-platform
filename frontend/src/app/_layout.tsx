
// Main navigation layout for the ITDMA app

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* Login Screen */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      {/* Registration Screen */}
      <Stack.Screen
        name="register"
        options={{ title: "Register" }}
      />

      {/* Forgot Password Screen */}
      <Stack.Screen
        name="forgot-password"
        options={{ title: "Forgot Password" }}
      />
    </Stack>
  );
}