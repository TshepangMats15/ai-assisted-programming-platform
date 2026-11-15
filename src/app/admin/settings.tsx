import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import api from "../../services/api";
import { useAppTheme } from "../../context/ThemeContext";

interface Student {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function StudentsSettingsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { isDark: isDarkMode, colors, toggleTheme } = useAppTheme();

  
const [loadError, setLoadError] = useState<string | null>(null);

const fetchStudents = useCallback(async () => {
  try {
    setLoading(true);
    setLoadError(null);

    const response = await api.users.getFirebaseStudents();

    console.log(
      "[Admin Settings] Users API response:",
      response
    );

    const data: any = response;

    const users = Array.isArray(data)
      ? data
      : Array.isArray(data?.users)
      ? data.users
      : Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data?.data)
      ? data.data
      : null;

    if (!users) {
      throw new Error(
        "The users API returned an unexpected response format."
      );
    }

    const studentsList: Student[] = users
      .filter((user: any) => {
        const role = String(
          user?.role ?? user?.userRole ?? ""
        )
          .trim()
          .toUpperCase()
          .replace(/^ROLE_/, "");

        return role === "STUDENT";
      })
      .map((user: any, index: number) => ({
        id: String(
          user.uid ??
          user.id ??
          user.userID ??
          user.userId ??
          `student-${index}`
        ),
        fullName:
          user.fullName ??
          user.full_name ??
          user.displayName ??
          user.name ??
          "Unnamed student",
        email: user.email ?? "No email",
        role: "STUDENT",
      }));

    console.log(
      "[Admin Settings] Students found:",
      studentsList.length
    );

    setStudents(studentsList);
  } catch (error: any) {
    console.error(
      "[Admin Settings] Failed to fetch students:",
      error
    );

    setLoadError(
      error?.message || "Unable to load students."
    );

    setStudents([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);


  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const upgradeToAdmin = (studentId: string, studentName: string) => {
    Alert.alert(
      "Confirm Upgrade",
      `Are you sure you want to make ${studentName} an Admin? They will have full access to the admin dashboard.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upgrade",
          style: "destructive",
          onPress: async () => {
            try {
              const student = students.find((item) => item.id === studentId);
              if (!student) throw new Error("Student could not be found.");

              await api.users.update(studentId, {
                fullName: student.fullName,
                email: student.email,
                role: "ADMIN",
              });

              Alert.alert("Success", `${studentName} is now an admin.`);
              setStudents((prev) =>
                prev.filter((item) => item.id !== studentId)
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.message || "Error updating student role."
              );
            }
          },
        },
      ]
    );
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/admin/adminindex");
    }
  };

  const dynamicStyles = getStyles(colors, isDarkMode);

  const renderItem = ({ item }: { item: Student }) => (
    <View style={dynamicStyles.card}>
      <View style={dynamicStyles.infoContainer}>
        <Text style={dynamicStyles.name}>{item.fullName}</Text>
        <Text style={dynamicStyles.email}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={dynamicStyles.upgradeButton}
        onPress={() => upgradeToAdmin(item.id, item.fullName)}
        activeOpacity={0.75}
      >
        <Text style={dynamicStyles.upgradeText}>Make Admin</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* HEADER WITH BACK BUTTON AND THEME TOGGLE */}
      <View style={dynamicStyles.headerContainer}>
        <View style={dynamicStyles.headerLeft}>
          <TouchableOpacity
            style={dynamicStyles.backButton}
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDarkMode ? "#FFFFFF" : "#111111"}
            />
          </TouchableOpacity>
          <Text style={dynamicStyles.headerTitle}>Admin Settings</Text>
        </View>

        <TouchableOpacity
          style={dynamicStyles.themeButton}
          onPress={toggleTheme}
          accessibilityRole="button"
          accessibilityLabel="Toggle appearance"
        >
          <Text style={dynamicStyles.themeButtonText}>
            {isDarkMode ? "☀️ Light" : "🌙 Dark"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.subHeader}>
        <Text style={dynamicStyles.subHeaderTitle}>Manage Students</Text>
        <Text style={dynamicStyles.subHeaderSubtitle}>
          Promote students to platform administrators.
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={dynamicStyles.centerContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={dynamicStyles.loadingText}>Loading students...</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={dynamicStyles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={dynamicStyles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={40}
                color={isDarkMode ? "#666666" : "#A0A0A0"}
              />
            <Text style={dynamicStyles.emptyText}>
              {loadError ?? "No students found."}
            </Text>  
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (
  colors: {
    background: string;
    backgroundElement: string;
    backgroundSelected: string;
    text: string;
    textSecondary: string;
  },
  isDarkMode: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.backgroundElement,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#292929" : "#E1E8ED",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    backButton: {
      padding: 6,
      marginRight: 10,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDarkMode ? "#F5F7FA" : "#1A1A1A",
    },
    themeButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colors.backgroundSelected,
      borderRadius: 20,
    },
    themeButtonText: {
      color: isDarkMode ? "#F5F7FA" : "#333333",
      fontSize: 13,
      fontWeight: "600",
    },
    subHeader: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 8,
    },
    subHeaderTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#FFFFFF" : "#111111",
    },
    subHeaderSubtitle: {
      fontSize: 13,
      color: isDarkMode ? "#A0A0A0" : "#666666",
      marginTop: 4,
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
      fontSize: 13,
      color: isDarkMode ? "#A0A0A0" : "#666666",
    },
    card: {
      flexDirection: "row",
      backgroundColor: isDarkMode ? "#1A1A1A" : "#FFFFFF",
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: isDarkMode ? "#292929" : "#E5E7EB",
      elevation: 2,
    },
    infoContainer: {
      flex: 1,
      paddingRight: 12,
    },
    name: {
      fontSize: 15,
      fontWeight: "600",
      color: isDarkMode ? "#F5F7FA" : "#1A1A1A",
    },
    email: {
      fontSize: 13,
      color: isDarkMode ? "#A0A0A0" : "#666666",
      marginTop: 4,
    },
    upgradeButton: {
      backgroundColor: "#8B5CF6",
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: 8,
    },
    upgradeText: {
      color: "#FFFFFF",
      fontWeight: "bold",
      fontSize: 13,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 60,
    },
    emptyText: {
      textAlign: "center",
      color: isDarkMode ? "#A0A0A0" : "#666666",
      marginTop: 12,
      fontSize: 15,
    },
  });