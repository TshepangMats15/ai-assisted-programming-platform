import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LearnScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Learn</Text>
        <Text style={styles.pageSubtitle}>Your enrolled courses</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Search courses..." placeholderTextColor="#999" />
        </View>

        <CourseCard icon="language-python" iconColor="#10B981" title="Basics of Python Programming" lessons="20" progress={70} color="#007AFF" />
        <CourseCard icon="web" iconColor="#A855F7" title="Introduction to Web Design" lessons="16" progress={30} color="#A855F7" />
        <CourseCard icon="coffee" iconColor="#8B4513" title="Basics of Java" lessons="18" progress={10} color="#E67E22" />
        <CourseCard icon="flash" iconColor="#F59E0B" title="JavaScript Essentials" lessons="14" progress={0} color="#10B981" />
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavItem icon="home-outline" label="Home" onPress={() => router.replace('/client/clienthome')} />
        <NavItem icon="book" label="Learn" active onPress={() => {}} />
        <NavItem icon="notifications-outline" label="Alerts" onPress={() => router.replace('/client/notification')} />
        <NavItem icon="person-outline" label="Profile" onPress={() => router.replace('/client/profile')} />
      </View>
    </SafeAreaView>
  );
}

const CourseCard = ({ icon, iconColor, title, lessons, progress, color }: any) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={[styles.iconBox, { backgroundColor: `${iconColor}15` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{lessons} lessons</Text>
      </View>
      <Text style={[styles.progressText, { color }]}>{progress}%</Text>
    </View>
    <View style={styles.progressBarBackground}>
      <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const NavItem = ({ icon, label, active = false, onPress }: any) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color={active ? '#007AFF' : '#999'} />
    <Text style={[styles.navLabel, active && { color: '#007AFF', fontWeight: 'bold' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  pageSubtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 15, height: 50, marginBottom: 25 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#999' },
  progressText: { fontSize: 14, fontWeight: 'bold' },
  progressBarBackground: { height: 6, backgroundColor: '#F0F2F5', borderRadius: 3 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#F0F2F5', justifyContent: 'space-around', paddingBottom: 30 },
  navItem: { alignItems: 'center' },
  navLabel: { fontSize: 12, color: '#999', marginTop: 4 },
});
