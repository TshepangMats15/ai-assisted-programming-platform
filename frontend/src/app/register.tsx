// Import React and React Native components
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

// Import Firebase registration function
import { createUserWithEmailAndPassword } from "firebase/auth";

// Import our Firebase authentication
import { auth } from "../services/firebase";

// Import Expo Router
import { router } from "expo-router";

export default function RegisterScreen() {
  // Store information entered by the student
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Used to show loading while creating the account
  const [loading, setLoading] = useState(false);

  // Function for registering a student
  const handleRegister = async () => {
    // Check that all fields have been completed
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please complete all fields.");
      return;
    }

    // Check that the passwords match
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    // Check if the password is strong enough
if (password.length < 8) {
  Alert.alert("Short Password", "Password must be at least 8 characters.");
  return;
}

if (!/[A-Z]/.test(password)) {
  Alert.alert("Weak Password", "Password must contain at least one uppercase letter.");
  return;
}

if (!/[a-z]/.test(password)) {
  Alert.alert("Weak Password", "Password must contain at least one lowercase letter.");
  return;
}

if (!/[0-9]/.test(password)) {
  Alert.alert("Weak Password", "Password must contain at least one number.");
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
      await createUserWithEmailAndPassword(auth, email.trim(), password);

      Alert.alert("Success", "Your account has been created.");

      // Return to the login page
      router.replace("/");
    } catch (error: any) {
      // Display Firebase error
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Text style={styles.subtitle}>
        Register as a student to continue
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
      {/*Password requirements Info*/}
      <Text style={styles.passwordInfo}>
        Password must have 8+ characters, uppercase, lowercase,
        number and special character.
      </Text>

      {/* Confirm password input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {/* Register button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
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
    </View>
  );
}

// Styling for the registration screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  loginText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
  },
  
  passwordInfo: {
  fontSize: 12,
  color: "#666666",
  marginBottom: 15,
  marginTop: -8,
  },
});