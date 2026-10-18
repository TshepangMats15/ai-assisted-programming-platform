import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminStudentsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic state variables
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);

  // Simulated Database Fetch
  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        // TODO: Replace this setTimeout with your actual backend database query.
        setTimeout(() => {
          const dbResponse = [
            { id: '1', name: 'Naledi Phakoe', course: 'Java', mark: '84%', status: 'P' },
            { id: '2', name: 'Tshepang Matsane', course: 'Java', mark: '89%', status: 'P' },
            { id: '3', name: 'Ayanda Dlamini', course: 'Python', mark: '73%', status: 'P' },
            { id: '4', name: 'Simphiwe Hadebe', course: 'Python', mark: '70%', status: 'P' },
            { id: '5', name: 'Zama Ndlovu', course: 'Web Design', mark: '92%', status: 'P' },
            { id: '6', name: 'Jason Miller', course: 'Java', mark: '45%', status: 'F' },
          ];
          
          setStudents(dbResponse);
          setIsLoading(false);
        }, 1000); 
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setIsLoading(false);
      }
    };

    fetchStudentsData();
  }, []);

  // Filter the fetched database results
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/adminindex'))}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
          <Text style={styles.headerTitle}>Students</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search and Filter Row */}
        <View style={styles.controlsRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search by name or course..." 
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Filter</Text>
            <Ionicons name="caret-down" size={14} color="#FFF" style={styles.filterIcon} />
          </TouchableOpacity>
        </View>

        {/* Students Table */}
        <View style={styles.tableCard}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={[styles.columnHeader, styles.colStudent]}>Student</Text>
            <Text style={[styles.columnHeader, styles.colCourse]}>Course</Text>
            <Text style={[styles.columnHeader, styles.colMark]}>Avg Mark</Text>
            <Text style={[styles.columnHeader, styles.colStatus]}>Status</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading student data...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <View 
                    key={student.id} 
                    style={[
                      styles.tableRow, 
                      index !== filteredStudents.length - 1 && styles.rowBorder
                    ]}
                  >
                    <Text style={[styles.cellText, styles.colStudent, styles.studentName]} numberOfLines={1}>
                      {student.name}
                    </Text>
                    <Text style={[styles.cellText, styles.colCourse]}>
                      {student.course}
                    </Text>
                    <Text style={[styles.cellText, styles.colMark, styles.markText]}>
                      {student.mark}
                    </Text>
                    <Text 
                      style={[
                        styles.cellText, 
                        styles.colStatus, 
                        styles.statusText,
                        student.status === 'F' && { color: '#FF3B30' } 
                      ]}
                    >
                      {student.status}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No students found.</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginLeft: 5 },
  content: { paddingHorizontal: 20, flex: 1 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 25, paddingHorizontal: 15, height: 45, marginRight: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', paddingHorizontal: 15, height: 45, borderRadius: 25, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 2 },
  filterText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  filterIcon: { marginLeft: 6 },
  tableCard: { backgroundColor: '#FFF', borderRadius: 15, paddingVertical: 10, paddingHorizontal: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, flex: 1, marginBottom: 20 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  tableHeaderRow: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 10, marginBottom: 5 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  columnHeader: { fontSize: 13, fontWeight: 'bold', color: '#999' },
  cellText: { fontSize: 14, color: '#666' },
  studentName: { color: '#333', fontWeight: '600' },
  markText: { fontWeight: 'bold', color: '#007AFF' },
  statusText: { fontWeight: 'bold', color: '#10B981' },
  colStudent: { flex: 2.5, paddingRight: 10 },
  colCourse: { flex: 1.5 },
  colMark: { flex: 1.2, textAlign: 'center' },
  colStatus: { flex: 1, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  loadingText: { marginTop: 10, color: '#666' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#999', fontSize: 15 },
});