import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ClientHome() {
  const router = useRouter();
  
  // State to hold dynamically fetched database info
  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [streak, setStreak] = useState(0);
  const [courses, setCourses] = useState<any[]>([]);

  // Simulated Database Fetch
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // TODO: INTEGRATION STAGE
        // Replace this setTimeout with your actual database fetch logic.
        // Example: const response = await fetch('https://your-api.com/user/profile');
        // const data = await response.json();
        
        setTimeout(() => {
          // Simulated backend response
          const dbResponse = {
            name: "Zama", // Try changing this to "" or null to see the "Student" fallback
            currentStreak: 5,
            enrolledCourses: [
              { id: '1', title: "Basics of Python Programming", progress: 70, icon: "language-python", iconColor: "#3776AB", barColor: "#007AFF" },
              { id: '2', title: "Introduction to Web Design", progress: 30, icon: "monitor-dashboard", iconColor: "#2C3E50", barColor: "#9b59b6" },
              { id: '3', title: "Basics of Java", progress: 10, icon: "coffee", iconColor: "#E74C3C", barColor: "#e67e22" },
              { id: '4', title: "JavaScript Essentials", progress: 15, icon: "language-javascript", iconColor: "#F1C40F", barColor: "#27ae60" }
            ]
          };

          setStudentName(dbResponse.name);
          setStreak(dbResponse.currentStreak);
          setCourses(dbResponse.enrolledCourses);
          setIsLoading(false);
        }, 1000); // 1-second simulated network delay
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleWipPress = (buttonName: string) => {
    Alert.alert(buttonName, "(Under construction)");
  };

  // Show a loading spinner while the database is querying
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Dynamic Hero Section */}
        <View style={styles.heroCard}>
          <Text style={styles.heroSubText}>Good morning, SAST ZA</Text>
          {/* Fallback logic applied here: displays 'Student' if studentName is empty or null */}
          <Text style={styles.heroTitle}>Hi {studentName || 'Student'},{'\n'}let&apos;s start learning</Text>
          <Text style={styles.heroStreak}>{streak}-day streak — keep it going!</Text>
          
          <View style={styles.streakDots}>
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <View key={i} style={[styles.dot, i <= streak && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Dynamic Progress Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Progress</Text>
          <TouchableOpacity onPress={() => handleWipPress("Progress Details")}>
            <Text style={styles.seeAll}>Details {'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressCard}>
          {courses.length > 0 ? (
            courses.map((course) => (
              <ProgressItem 
                key={course.id}
                icon={course.icon} 
                iconColor={course.iconColor} 
                title={course.title} 
                progress={course.progress} 
                barColor={course.barColor} 
              />
            ))
          ) : (
            <Text style={styles.emptyText}>You haven&apos;t enrolled in any courses yet.</Text>
          )}
        </View>

        <View style={styles.actionButtonsContainer}>
          <ActionButton title="+ New project" onPress={() => handleWipPress("New project")} />
          <ActionButton title="My projects" onPress={() => handleWipPress("My projects")} />
          <ActionButton title="AI Assistant" onPress={() => handleWipPress("AI Assistant")} />
          <ActionButton title="AI Assistant- Docs" onPress={() => handleWipPress("AI Assistant- Docs")} />
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavItem icon="home" label="Home" active onPress={() => {}} />
        <NavItem icon="book-outline" label="Learn" onPress={() => router.replace('/client/learn')} />
        <NavItem icon="notifications-outline" label="Alerts" onPress={() => router.replace('/client/notification')} />
        <NavItem icon="person-outline" label="Profile" onPress={() => router.replace('/client/profile')} />
      </View>
    </SafeAreaView>
  );
}

// Reusable Components
const ProgressItem = ({ icon, iconColor, title, progress, barColor }: any) => (
  <View style={styles.progressItem}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
    </View>
    <View style={styles.progressInfo}>
      <View style={styles.progressTextRow}>
        <Text style={styles.progressTitle} numberOfLines={1}>{title}</Text>
        <Text style={[styles.progressPercent, { color: barColor }]}>{progress}%</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  </View>
);

const ActionButton = ({ title, onPress }: any) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Text style={styles.actionButtonText}>{title}</Text>
  </TouchableOpacity>
);

const NavItem = ({ icon, label, active = false, onPress }: any) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color={active ? '#007AFF' : '#999'} />
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  heroCard: { backgroundColor: '#007AFF', borderRadius: 20, padding: 25, marginBottom: 25, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  heroSubText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  heroTitle: { color: '#FFF', fontSize: 26, fontWeight: 'bold', marginBottom: 15 },
  heroStreak: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 10 },
  streakDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 25, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  dotActive: { backgroundColor: '#FFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  seeAll: { color: '#007AFF', fontWeight: '600' },
  progressCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  emptyText: { textAlign: 'center', color: '#999', paddingVertical: 10 },
  progressItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  progressInfo: { flex: 1 },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1 },
  progressPercent: { fontSize: 14, fontWeight: 'bold', marginLeft: 10 },
  progressBarBackground: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  actionButtonsContainer: { gap: 15, marginBottom: 20 },
  actionButton: { backgroundColor: '#2A1B38', borderRadius: 25, paddingVertical: 18, alignItems: 'center' },
  actionButtonText: { color: '#A855F7', fontSize: 16, fontWeight: '600' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#F0F2F5', justifyContent: 'space-around', paddingBottom: 30 },
  navItem: { alignItems: 'center' },
  navLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  navLabelActive: { color: '#007AFF', fontWeight: '600' },
});