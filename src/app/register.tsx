
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { router } from "expo-router";

export default function RegisterScreen() {
  // Store information entered by the student
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Control password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Show loading while creating the account
  const [loading, setLoading] = useState(false);

  // Function for registering a student
  const handleRegister = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert("Error", "Please complete all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Short Password",
        "Password must be at least 8 characters."
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      Alert.alert(
        "Weak Password",
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    if (!/[a-z]/.test(password)) {
      Alert.alert(
        "Weak Password",
        "Password must contain at least one lowercase letter."
      );
      return;
    }

    if (!/[0-9]/.test(password)) {
      Alert.alert(
        "Weak Password",
        "Password must contain at least one number."
      );
      return;
    }

    if (!/[!@#$%^&*]/.test(password)) {
      Alert.alert(
        "Weak Password",
        "Password must contain at least one special character (!@#$%^&*)."
      );
      return;
    }

    try {
      setLoading(true);

      // Create the account using Firebase
      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      Alert.alert(
        "Success",
        "Your account has been created."
      );

      // Navigate to Student dashboard
      router.replace("/(student)/dashboard");
    } catch (error: any) {
      let message = "Unable to create your account.";

      if (error.code === "auth/email-already-in-use") {
        message = "This email address is already registered.";
      } else if (error.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        message = "Please choose a stronger password.";
      } else if (error.code === "auth/network-request-failed") {
        message = "Please check your internet connection.";
      }

      Alert.alert("Registration Failed", message);
    } finally {
      setLoading(false);
    }
  };

  // TEMPORARY: Open Admin dashboard for testing
  const handleAdminTest = () => {
    router.push("/admin/adminindex");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>
          Register as a student to continue
        </Text>

        {/* Email input */}
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#888888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Password input */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#888888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
            accessibilityRole="button"
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={23}
              color="#A78BFA"
            />
          </TouchableOpacity>
        </View>

        {/* Password requirements */}
        <Text style={styles.passwordInfo}>
          Password must have 8+ characters, uppercase, lowercase,
          number and special character.
        </Text>

        {/* Confirm password */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            placeholderTextColor="#888888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />

          <TouchableOpacity
            onPress={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            accessibilityLabel={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
            accessibilityRole="button"
          >
            <Ionicons
              name={
                showConfirmPassword
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={23}
              color="#A78BFA"
            />
          </TouchableOpacity>
        </View>

        {/* Register button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity onPress={() => router.push("/")}>
          <Text style={styles.loginText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>

        {/* TEMPORARY ADMIN TEST BUTTON */}
        {__DEV__ && (
          <View style={styles.adminSection}>
            <Text style={styles.adminLabel}>
              DEVELOPMENT TESTING
            </Text>

            <TouchableOpacity
              style={styles.adminButton}
              onPress={handleAdminTest}
              accessibilityRole="button"
              accessibilityLabel="Test Admin Dashboard"
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color="#A78BFA"
              />

              <Text style={styles.adminButtonText}>
                Test Admin Dashboard
              </Text>

              <Ionicons
                name="arrow-forward-outline"
                size={19}
                color="#A78BFA"
              />
            </TouchableOpacity>

            <Text style={styles.adminNote}>
              Temporary access for testing Member 2's screens.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// DevMate dark and purple theme
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
  },

  form: {
    width: "100%",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#FFFFFF",
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#AAAAAA",
  },

  input: {
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    minHeight: 55,
    backgroundColor: "#1A1A1A",
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingRight: 10,
    color: "#FFFFFF",
  },

  passwordInfo: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 15,
    marginTop: -8,
  },

  button: {
    backgroundColor: "#8B5CF6",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  loginText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
    color: "#A78BFA",
  },

  adminSection: {
    marginTop: 35,
    borderTopWidth: 1,
    borderTopColor: "#292929",
    paddingTop: 20,
  },

  adminLabel: {
    color: "#777777",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#8B5CF6",
    borderRadius: 10,
    padding: 16,
    backgroundColor: "#1A1A1A",
  },

  adminButtonText: {
    color: "#A78BFA",
    fontSize: 15,
    fontWeight: "bold",
  },

  adminNote: {
    textAlign: "center",
    color: "#777777",
    fontSize: 12,
    marginTop: 10,
  },
});
