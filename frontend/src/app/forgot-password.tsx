// Forgot Password Screen

import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";

export default function ForgotPasswordScreen() {
  // Store the email entered by the user
  const [email, setEmail] = useState("");

  // Used while Firebase sends the reset email
  const [loading, setLoading] = useState(false);

  // Send password reset email
  const handleResetPassword = async () => {
    // Check that an email was entered
    if (!email) {
      Alert.alert(
        "Error",
        "Please enter your email address."
      );
      return;
    }

    try {
      setLoading(true);

      // Ask Firebase to send the password reset email
      await sendPasswordResetEmail(
        auth,
        email.trim()
      );

      Alert.alert(
        "Email Sent",
        "Check your email for instructions to reset your password."
      );

    } catch (error: any) {
      Alert.alert(
        "Reset Failed",
        "Please check your email address and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Forgot Password
      </Text>

      <Text style={styles.subtitle}>
        Enter your email address and we will send you
        instructions to reset your password.
      </Text>

      {/* Email input */}
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Reset password button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            Reset Password
          </Text>
        )}
      </TouchableOpacity>

      {/* Return to login */}
      <TouchableOpacity
        onPress={() => router.replace("/")}
      >
        <Text style={styles.backText}>
          Back to Login
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666666",
    marginBottom: 30,
    lineHeight: 22,
  },

  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  backText: {
    textAlign: "center",
    color: "#2563eb",
    marginTop: 25,
    fontSize: 15,
  },
});