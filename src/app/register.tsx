import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { useAuth } from "../context/AuthContext";

import { router } from "expo-router";
import { sendEmailVerification } from "firebase/auth";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const [loadingMessage, setLoadingMessage] =
    useState("Creating account...");

  const handleRegister = async () => {

    if (loading) {
      return;
    }

    const cleanFirstName = firstName.trim();
    const cleanSurname = surname.trim();
    const cleanEmail = email.trim();

    const fullName =
      `${cleanFirstName} ${cleanSurname}`;

    // STEP 1: Validate registration information.
    if (
      !cleanFirstName ||
      !cleanSurname ||
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Missing Information",
        "Please complete all fields."
      );
      return;
    }

    if (fullName.length > 255) {
      Alert.alert(
        "Invalid Name",
        "Your full name must not exceed 255 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Passwords do not match."
      );
      return;
    }

    // Match the password requirements shown on screen.
    const validPassword =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9\s]/.test(password);

    if (!validPassword) {
      Alert.alert(
        "Weak Password",
        "Your password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number and a special character."
      );
      return;
    }

    setLoading(true);
    setLoadingMessage("Creating account...");

    try {
      setLoadingMessage("Creating and synchronizing account...");
      await register(cleanEmail, password, fullName);
    } catch (error: any) {
      Alert.alert("Registration Failed", error?.code === "auth/email-already-in-use"
        ? "An account already exists with this email. Please log in."
        : error?.message || "Unable to create your account.");
    } finally {

      setLoading(false);
      setLoadingMessage("Creating account...");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        Create Account
      </Text>

      <Text style={styles.subtitle}>
        Register as a student to continue
      </Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Surname"
        value={surname}
        onChangeText={setSurname}
        autoCapitalize="words"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />

      <Text style={styles.passwordInfo}>
        Password must have 8+ characters,
        uppercase, lowercase, number and
        special character.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />

      <TouchableOpacity
        style={[
          styles.button,
          loading && styles.disabledButton,
        ]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <>
            <ActivityIndicator color="#FFFFFF" />

            <Text style={styles.loadingText}>
              {loadingMessage}
            </Text>
          </>
        ) : (
          <Text style={styles.buttonText}>
            Register as Student
          </Text>
        )}
      </TouchableOpacity>


      <TouchableOpacity
        onPress={() => router.push("/")}
        disabled={loading}
      >
        <Text style={styles.loginText}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 25,
    color: "#666666",
  },

  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
  },

  button: {
    backgroundColor: "#8B5CF6",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  loadingText: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 8,
    fontWeight: "600",
  },


  loginText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
    color: "#8B5CF6",
  },

  passwordInfo: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 12,
    marginTop: -4,
  },
});
