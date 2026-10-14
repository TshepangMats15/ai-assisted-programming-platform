import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { router } from "expo-router";

export default function ProjectsScreen() {
  const [projectName, setProjectName] = useState("");
  const [showInput, setShowInput] = useState(false);

  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Python Practice",
      language: "Python",
      status: "In Progress",
    },
    {
      id: 2,
      name: "My First Calculator",
      language: "Python",
      status: "In Progress",
    },
  ]);

  // Create a new project
  const handleCreateProject = () => {
    if (projectName.trim() === "") {
      Alert.alert("Error", "Please enter a project name.");
      return;
    }

    const newProject = {
      id: Date.now(),
      name: projectName.trim(),
      language: "Python",
      status: "Not Started",
    };

    setProjects([...projects, newProject]);
    setProjectName("");
    setShowInput(false);

    Alert.alert("Success", "Project created successfully.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Projects</Text>
        <Text style={styles.subtitle}>
          Create and manage your programming projects.
        </Text>

        {/* PROJECT OVERVIEW */}

        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Total Projects</Text>
          <Text style={styles.projectCount}>
            {projects.length}
          </Text>
          <Text style={styles.overviewDescription}>
            Keep practising and improving your coding skills.
          </Text>
        </View>

        {/* CREATE PROJECT BUTTON */}

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowInput(!showInput)}
        >
          <Text style={styles.createButtonText}>
            + New Project
          </Text>
        </TouchableOpacity>

        {/* CREATE PROJECT FORM */}

        {showInput && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              Create New Project
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter project name"
              placeholderTextColor="#777777"
              value={projectName}
              onChangeText={setProjectName}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleCreateProject}
            >
              <Text style={styles.saveButtonText}>
                Create Project
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PROJECT LIST */}

        <Text style={styles.sectionTitle}>
          Your Projects
        </Text>

        {projects.map((project) => (
          <View key={project.id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <View style={styles.projectIcon}>
                <Text style={styles.iconText}>{"</>"}</Text>
              </View>

              <View style={styles.projectDetails}>
                <Text style={styles.projectName}>
                  {project.name}
                </Text>

                <Text style={styles.projectLanguage}>
                  {project.language}
                </Text>
              </View>
            </View>

            <Text style={styles.projectStatus}>
              Status: {project.status}
            </Text>

            <TouchableOpacity
              style={styles.openButton}
              onPress={() => router.push("/coding-workspace")}
            >
              <Text style={styles.openButtonText}>
                Open Coding Workspace →
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  backText: {
    color: "#8B5CF6",
    fontSize: 16,
    marginBottom: 25,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#A3A3A3",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 25,
  },
  overviewCard: {
    backgroundColor: "#1A1A1A",
    padding: 22,
    borderRadius: 12,
    marginBottom: 20,
  },
  overviewTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  projectCount: {
    color: "#8B5CF6",
    fontSize: 38,
    fontWeight: "bold",
    marginTop: 12,
  },
  overviewDescription: {
    color: "#A3A3A3",
    fontSize: 13,
    marginTop: 8,
  },
  createButton: {
    backgroundColor: "#8B5CF6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 25,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  formCard: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  formTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#262626",
    borderRadius: 10,
    padding: 14,
    color: "#FFFFFF",
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#8B5CF6",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  projectCard: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  projectIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#2D2140",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconText: {
    color: "#A78BFA",
    fontSize: 17,
    fontWeight: "bold",
  },
  projectDetails: {
    flex: 1,
  },
  projectName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  projectLanguage: {
    color: "#888888",
    fontSize: 12,
    marginTop: 5,
  },
  projectStatus: {
    color: "#A78BFA",
    fontSize: 12,
    marginBottom: 15,
  },
  openButton: {
    backgroundColor: "#2D2140",
    padding: 13,
    borderRadius: 8,
    alignItems: "center",
  },
  openButtonText: {
    color: "#C4B5FD",
    fontSize: 13,
    fontWeight: "bold",
  },
});