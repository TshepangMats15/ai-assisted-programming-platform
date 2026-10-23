
import React, { useState, useRef } from "react";
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

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    const userText = message.trim();

    if (!userText || loading) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-student`,
        role: "student",
        text: userText,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error(
          "You are not signed in. Please log in before using AI Assistance."
        );
      }

      const firebaseToken = await user.getIdToken();

      const aiResponse = await askAI(userText, firebaseToken);

      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: aiResponse,
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      console.error("DevMate AI Error:", errorMessage);

      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          text: `Unable to get an AI response.\n\n${errorMessage}`,
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>AI Assistant</Text>

          <Text style={styles.subtitle}>
            Your programming learning companion
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
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

              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          ))}

          {loading && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <ActivityIndicator color="#8B5CF6" />
              <Text style={styles.loadingText}>
                DevMate AI is thinking...
              </Text>
            </View>
          )}
        </ScrollView>

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
            disabled={loading}
          >
            <Text style={styles.sendText}>Send</Text>
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

  loadingText: {
    color: "#A3A3A3",
    fontSize: 12,
    marginTop: 8,
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

  disabledButton: {
    opacity: 0.5,
  },

  sendText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
