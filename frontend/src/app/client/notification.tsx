import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AlertsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AlertCard 
          title="Fintech Hackathon Day" badgeText="TOMORROW" 
          description="Goes live: 18 Aug 2026- 08:00 SAST" 
        />
        <AlertCard 
          title="Almost there..." badgeText="ATTEMPT" 
          description="You are almost done with your Basics of Python Programming. Lets get that completed" 
        />
        <AlertCard 
          title="New Java Course" subtitle="Java Intermediate" badgeText="ATTEMPT" 
          description="Take your Java skills to the next level by learning how to build more structured, efficient, and reusable programs." 
        />
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavItem icon="home-outline" label="Home" onPress={() => router.replace('/client/clienthome')} />
        <NavItem icon="book-outline" label="Learn" onPress={() => router.replace('/client/learn')} />
        <NavItem icon="notifications" label="Alerts" active onPress={() => {}} />
        <NavItem icon="person-outline" label="Profile" onPress={() => router.replace('/client/profile')} />
      </View>
    </SafeAreaView>
  );
}

const AlertCard = ({ title, subtitle, badgeText, description }: any) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.badge}><Text style={styles.badgeText}>{badgeText}</Text></View>
    </View>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    <Text style={styles.description}>{description}</Text>
  </View>
);

const NavItem = ({ icon, label, active = false, onPress }: any) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color={active ? '#007AFF' : '#999'} />
    <Text style={[styles.navLabel, active && { color: '#007AFF', fontWeight: 'bold' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollContent: { padding: 20, paddingTop: 40, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#A855F7', flex: 1, marginRight: 10 },
  subtitle: { fontSize: 15, fontWeight: '700', color: '#A855F7', marginBottom: 10 },
  badge: { backgroundColor: '#F3E8FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  badgeText: { color: '#8B5CF6', fontSize: 12, fontWeight: 'bold' },
  description: { color: '#888888', fontSize: 14, lineHeight: 20, marginTop: 10 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#F0F2F5', justifyContent: 'space-around', paddingBottom: 30 },
  navItem: { alignItems: 'center' },
  navLabel: { fontSize: 12, color: '#999', marginTop: 4 },
});
