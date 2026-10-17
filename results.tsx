import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminResultsScreen() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState('All');
  const [results, setResults] = useState<any[]>([]);

  const courseFilters = ['All', 'Java', 'Python', 'Web Design', 'JavaScript'];

  useEffect(() => {
    // Simulated Database Fetch
    const fetchResultsData = async () => {
      try {
        // TODO: INTEGRATION STAGE
        // Replace with your actual backend query to fetch student marks.
        
        setTimeout(() => {
          const dbResponse = [
            { id: '1', student: 'Naledi Phakoe', course: 'Java', assessment: 'OOP Midterm', score: 88, grade: 'A' },
            { id: '2', student: 'Ayanda Dlamini', course: 'Python', assessment: 'Loops Quiz', score: 72, grade: 'B' },
            { id: '3', student: 'Simphiwe Hadebe', course: 'Python', assessment: 'Final Project', score: 91, grade: 'A+' },
            { id: '4', student: 'Tshepang Matsane', course: 'Java', assessment: 'OOP Midterm', score: 65, grade: 'C' },
            { id: '5', student: 'Zama Ndlovu', course: 'Web Design', assessment: 'Flexbox Task', score: 95, grade: 'A+' },
            { id: '6', student: 'Jason Miller', course: 'Java', assessment: 'Arrays Quiz', score: 45, grade: 'F' },
            { id: '7', student: 'Sarah Jones', course: 'JavaScript', assessment: 'DOM Manipulation', score: 82, grade: 'B+' },
          ];
          
          setResults(dbResponse);
          setIsLoading(false);
        }, 800); // Simulated delay
      } catch (error) {
        console.error("Failed to fetch results:", error);
        setIsLoading(false);
      }
    };

    fetchResultsData();
  }, []);

  // Filter results based on the selected course tab
  const filteredResults = results.filter(
    result => activeCourse === 'All' || result.course === activeCourse
  );

  // Helper function to color-code grades
  const getGradeColor = (grade: string) => {
    if (grade.includes('A')) return '#10B981'; // Green
    if (grade.includes('B')) return '#007AFF'; // Blue
    if (grade.includes('C')) return '#F59E0B'; // Orange
    return '#FF3B30'; // Red for D/F
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/index'))}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
          <Text style={styles.headerTitle}>Results</Text>
        </TouchableOpacity>
      </View>

      {/* Course Filter Pills */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {courseFilters.map((course, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.filterPill, 
                activeCourse === course && styles.filterPillActive
              ]}
              onPress={() => setActiveCourse(course)}
            >
              <Text style={[
                styles.filterText, 
                activeCourse === course && styles.filterTextActive
              ]}>
                {course}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {/* Results Table */}
        <View style={styles.tableCard}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={[styles.columnHeader, styles.colStudent]}>Student</Text>
            <Text style={[styles.columnHeader, styles.colTask]}>Assessment</Text>
            <Text style={[styles.columnHeader, styles.colScore]}>Score</Text>
            <Text style={[styles.columnHeader, styles.colGrade]}>Grade</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Fetching marks...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredResults.length > 0 ? (
                filteredResults.map((item, index) => (
                  <View 
                    key={item.id} 
                    style={[
                      styles.tableRow, 
                      index !== filteredResults.length - 1 && styles.rowBorder
                    ]}
                  >
                    <View style={styles.colStudent}>
                      <Text style={styles.studentName} numberOfLines={1}>{item.student}</Text>
                      {/* Show the course name under the student if viewing 'All' */}
                      {activeCourse === 'All' && (
                        <Text style={styles.studentCourse}>{item.course}</Text>
                      )}
                    </View>
                    <Text style={[styles.cellText, styles.colTask]} numberOfLines={2}>
                      {item.assessment}
                    </Text>
                    <Text style={[styles.cellText, styles.colScore, styles.scoreText]}>
                      {item.score}%
                    </Text>
                    <View style={styles.colGrade}>
                      <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(item.grade) + '15' }]}>
                        <Text style={[styles.gradeText, { color: getGradeColor(item.grade) }]}>
                          {item.grade}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No results found for {activeCourse}.</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginLeft: 5 },
  
  filterContainer: { marginBottom: 15 },
  filterScroll: { paddingHorizontal: 20, gap: 10, paddingBottom: 5 },
  filterPill: { backgroundColor: '#FFF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  filterPillActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#FFF' },

  content: { paddingHorizontal: 20, flex: 1 },
  tableCard: { backgroundColor: '#FFF', borderRadius: 15, paddingVertical: 10, paddingHorizontal: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, flex: 1, marginBottom: 20 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  tableHeaderRow: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 10, marginBottom: 5 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  
  columnHeader: { fontSize: 12, fontWeight: 'bold', color: '#999', textTransform: 'uppercase' },
  cellText: { fontSize: 14, color: '#666' },
  
  colStudent: { flex: 2.5, paddingRight: 10, justifyContent: 'center' },
  colTask: { flex: 2, paddingRight: 10 },
  colScore: { flex: 1, textAlign: 'center' },
  colGrade: { flex: 1.2, alignItems: 'flex-end' },

  studentName: { color: '#333', fontWeight: '600', fontSize: 14 },
  studentCourse: { color: '#999', fontSize: 12, marginTop: 2 },
  scoreText: { fontWeight: 'bold', color: '#333' },
  
  gradeBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  gradeText: { fontWeight: 'bold', fontSize: 13 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  loadingText: { marginTop: 10, color: '#666' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#999', fontSize: 15 },
});