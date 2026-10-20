import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";

export default function AIAssistantScreen() {
  // Store the message currently being typed
  const [message, setMessage] = useState("");

  // Store all chat messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Hi! I'm your DevMate AI Assistant. Ask me anything about programming.",
    },
  ]);

  // Add a student message and a temporary demo response
  const handleSend = () => {
    if (message.trim() === "") {
      return;
    }

    const newMessage = {
      id: Date.now(),
      role: "student",
      text: message.trim(),
    };

    const demoResponse = {
      id: Date.now() + 1,
      role: "assistant",
      text: "Your question has been received. AI responses will be available once the backend is connected.",
    };

    // Update the chat with both messages
    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
      demoResponse,
    ]);

    // Clear the input field
    setMessage("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>AI Assistant</Text>

          <Text style={styles.subtitle}>
            Your programming learning companion
          </Text>
        </View>

        {/* ================= CHAT MESSAGES ================= */}

        <ScrollView
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((item) => (
            <View
              key={item.id}
              style={[
                styles.messageBubble,
                item.role === "student"
                  ? styles.studentBubble
                  : styles.assistantBubble,
              ]}
            >
              <Text style={styles.messageRole}>
                {item.role === "student" ? "You" : "DevMate AI"}
              </Text>

              <Text style={styles.messageText}>
                {item.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* ================= MESSAGE INPUT ================= */}

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Ask a programming question..."
            placeholderTextColor="#777777"
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },

  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#292929",
  },

  backText: {
    color: "#8B5CF6",
    fontSize: 16,
    marginBottom: 15,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#A3A3A3",
    fontSize: 13,
    marginTop: 5,
  },

  chatArea: {
    flex: 1,
  },

  chatContent: {
    padding: 16,
    paddingBottom: 25,
  },

  messageBubble: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 14,
    maxWidth: "85%",
  },

  assistantBubble: {
    backgroundColor: "#1A1A1A",
    alignSelf: "flex-start",
  },

  studentBubble: {
    backgroundColor: "#5B21B6",
    alignSelf: "flex-end",
  },

  messageRole: {
    color: "#C4B5FD",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
  },

  messageText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 21,
  },

  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#151515",
    gap: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#262626",
    borderRadius: 10,
    padding: 12,
    color: "#FFFFFF",
    maxHeight: 110,
  },

  sendButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 10,
  },

  sendText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
