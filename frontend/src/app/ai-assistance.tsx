
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
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import { askAI } from "../services/aiServices";

type ChatMessage = {
  id: string;
  role: "assistant" | "student";
  text: string;
};

export default function AIAssistantScreen() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm your DevMate AI Assistant. Ask me anything about programming.",
    },
  ]);

  const handleSend = async () => {
    const userText = message.trim();

    if (!userText || loading) {
      return;
    }

    const newMessage: ChatMessage = {
      id: `${Date.now()}-student`,
      role: "student",
      text: userText,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      // Get the currently signed-in Firebase user.
      const user = getAuth().currentUser;

      if (!user) {
        throw new Error(
          "Please log in before using DevMate AI."
        );
      }

      // Get the user's Firebase authentication token.
      const firebaseToken = await user.getIdToken();

      // Send the question and token to the real backend.
      const aiResponse = await askAI(
        userText,
        firebaseToken
      );

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: aiResponse,
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          text:
            "Unable to get an AI response. " +
            errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ‹ Back
            </Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            AI Assistant
          </Text>

          <Text style={styles.subtitle}>
            Your programming learning companion
          </Text>
        </View>

        {/* CHAT MESSAGES */}
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
                {item.role === "student"
                  ? "You"
                  : "DevMate AI"}
              </Text>

              <Text style={styles.messageText}>
                {item.text}
              </Text>
            </View>
          ))}

          {loading && (
            <View
              style={[
                styles.messageBubble,
                styles.assistantBubble,
                styles.loadingBubble,
              ]}
            >
              <ActivityIndicator
                size="small"
                color="#8B5CF6"
              />

              <Text style={styles.loadingText}>
                DevMate AI is thinking...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* MESSAGE INPUT */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Ask a programming question..."
            placeholderTextColor="#777777"
            value={message}
            onChangeText={setMessage}
            multiline
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleSend}
            disabled={loading || !message.trim()}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.sendText}>
                Send
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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

  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  loadingText: {
    color: "#A3A3A3",
    fontSize: 13,
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
    minWidth: 65,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.5,
  },

  sendText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
