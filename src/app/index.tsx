// Login Screen

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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

export default function LoginScreen() {
  // Store the user's email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Used to show loading while Firebase checks the login
  const [loading, setLoading] = useState(false);

  // Login function
  const handleLogin = async () => {
    // Check if the user completed both fields
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      // Login using Firebase Authentication
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      Alert.alert("Success", "Login successful.");

      // connect to dashboard after registration
      router.replace("/dashboard");

    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        "Incorrect email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Application name */}
      <Text style={styles.appName}>DevMate</Text>

      <Text style={styles.title}>Welcome Back</Text>

      <Text style={styles.subtitle}>
        Login to continue your learning
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

      {/* Password input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Forgot Password link */}
      <TouchableOpacity
        onPress={() => router.push("/forgot-password")}
      >
        <Text style={styles.forgotPassword}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* Login button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            Login
          </Text>
        )}
      </TouchableOpacity>

      {/* Register link */}
      <TouchableOpacity
        onPress={() => router.push("/register")}
      >
        <Text style={styles.registerText}>
          Don't have an account?{" "}
          <Text style={styles.registerLink}>
            Register
          </Text>
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

  appName: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2563eb",
    marginBottom: 30,
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
    marginBottom: 30,
    color: "#666666",
  },

  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  forgotPassword: {
    textAlign: "right",
    color: "#2563eb",
    marginBottom: 20,
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

  registerText: {
    textAlign: "center",
    marginTop: 25,
    fontSize: 15,
  },

  registerLink: {
    color: "#2563eb",
    fontWeight: "bold",
  },
});