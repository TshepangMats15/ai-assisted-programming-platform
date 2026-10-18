import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminAiUsageScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // State for our dynamic database metrics
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // Simulate Database Fetch
    const fetchAiData = async () => {
      try {
        // TODO: INTEGRATION STAGE & Replace with actual backend API call.
        // Example: const response = await fetch('https://my-api.com/admin/ai-metrics');
        
        setTimeout(() => {
          const dbResponse = {
            overview: {
              answeredWithAi: 12450,
              answeredWithoutAi: 8300,
              avgSimilarityScore: 42, // Percentage
            },
            courseUsage: [
              { id: '1', course: 'Python', quiz: 'Loops & Arrays', avgRequests: 14.5, trend: 'up' },
              { id: '2', course: 'Java', quiz: 'OOP Concepts', avgRequests: 12.2, trend: 'up' },
              { id: '3', course: 'Web Design', quiz: 'CSS Flexbox', avgRequests: 8.1, trend: 'neutral' },
              { id: '4', course: 'JavaScript', quiz: 'DOM Manipulation', avgRequests: 5.4, trend: 'down' },
            ]
          };
          
          setMetrics(dbResponse);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch AI usage data:", error);
        setIsLoading(false);
      }
    };

    fetchAiData();
  }, []);

  if (isLoading || !metrics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/adminindex'))}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
            <Text style={styles.headerTitle}>AI Usage</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Analyzing AI telemetry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate percentages for the comparison bars
  const totalQuestions = metrics.overview.answeredWithAi + metrics.overview.answeredWithoutAi;
  const aiPercentage = Math.round((metrics.overview.answeredWithAi / totalQuestions) * 100);
  const manualPercentage = 100 - aiPercentage;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/adminindex'))}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
          <Text style={styles.headerTitle}>AI Usage</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top High-Level Metrics */}
        <View style={styles.metricsRow}>
          
          {/* Average Similarity Card */}
          <View style={[styles.card, styles.halfCard]}>
            <View style={styles.cardHeaderIcon}>
              <MaterialCommunityIcons name="text-box-search-outline" size={20} color="#007AFF" />
              <Text style={styles.cardTitle}>Avg. AI Similarity</Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLarge}>{metrics.overview.avgSimilarityScore}%</Text>
              <Text style={styles.scoreSubtitle}>Code overlap</Text>
            </View>
          </View>

          {/* AI vs Manual Quick Stats */}
          <View style={[styles.card, styles.halfCard]}>
            <View style={styles.cardHeaderIcon}>
              <MaterialCommunityIcons name="brain" size={20} color="#A855F7" />
              <Text style={styles.cardTitle}>Total Answers</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.statRow}><Text style={styles.statBold}>{metrics.overview.answeredWithAi}</Text> with AI</Text>
              <Text style={styles.statRow}><Text style={styles.statBold}>{metrics.overview.answeredWithoutAi}</Text> manual</Text>
            </View>
          </View>
        </View>

        {/* Answer Breakdown Bar Chart */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Answering Method Ratio</Text>
          <View style={styles.stackedBarContainer}>
            <View style={[styles.barSegment, { width: `${aiPercentage}%`, backgroundColor: '#A855F7' }]} />
            <View style={[styles.barSegment, { width: `${manualPercentage}%`, backgroundColor: '#10B981' }]} />
          </View>
          <View style={styles.barLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#A855F7' }]} />
              <Text style={styles.legendText}>With AI ({aiPercentage}%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Without AI ({manualPercentage}%)</Text>
            </View>
          </View>
        </View>

        {/* Highest AI Usage by Course/Quiz Table */}
        <Text style={[styles.sectionTitle, { marginLeft: 5, marginTop: 10 }]}>Highest Usage by Course/Quiz</Text>
        <View style={styles.tableCard}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={[styles.columnHeader, styles.colCourse]}>Course</Text>
            <Text style={[styles.columnHeader, styles.colQuiz]}>Quiz/Topic</Text>
            <Text style={[styles.columnHeader, styles.colRequests]}>Avg. Req.</Text>
          </View>

          {metrics.courseUsage.map((item: any, index: number) => (
            <View 
              key={item.id} 
              style={[
                styles.tableRow, 
                index !== metrics.courseUsage.length - 1 && styles.rowBorder
              ]}
            >
              <Text style={[styles.cellText, styles.colCourse, styles.courseName]} numberOfLines={1}>
                {item.course}
              </Text>
              <Text style={[styles.cellText, styles.colQuiz]} numberOfLines={1}>
                {item.quiz}
              </Text>
              <View style={[styles.colRequests, styles.requestCell]}>
                <Text style={styles.requestText}>{item.avgRequests}</Text>
                {item.trend === 'up' && <Ionicons name="arrow-up" size={14} color="#FF3B30" />}
                {item.trend === 'down' && <Ionicons name="arrow-down" size={14} color="#10B981" />}
                {item.trend === 'neutral' && <Ionicons name="remove" size={14} color="#999" />}
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginLeft: 5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, color: '#666', fontSize: 16 },
  
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  halfCard: { flex: 0.48, padding: 15 },
  cardHeaderIcon: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginLeft: 8 },
  
  scoreContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  scoreLarge: { fontSize: 32, fontWeight: 'bold', color: '#007AFF' },
  scoreSubtitle: { fontSize: 12, color: '#999', marginTop: 4 },
  
  statsContainer: { justifyContent: 'center', flex: 1 },
  statRow: { fontSize: 14, color: '#666', marginBottom: 6 },
  statBold: { fontWeight: 'bold', color: '#333' },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  stackedBarContainer: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 15 },
  barSegment: { height: '100%' },
  barLegend: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 5 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 13, color: '#666' },

  tableCard: { backgroundColor: '#FFF', borderRadius: 15, paddingVertical: 10, paddingHorizontal: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, marginBottom: 20 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  tableHeaderRow: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 10, marginBottom: 5 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  columnHeader: { fontSize: 13, fontWeight: 'bold', color: '#999' },
  cellText: { fontSize: 14, color: '#666' },
  courseName: { color: '#333', fontWeight: '600' },
  
  colCourse: { flex: 1.5, paddingRight: 10 },
  colQuiz: { flex: 2, paddingRight: 10 },
  colRequests: { flex: 1, textAlign: 'right' },
  
  requestCell: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  requestText: { fontWeight: 'bold', color: '#007AFF', marginRight: 4, fontSize: 15 },
});