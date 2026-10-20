import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={40} color="#999" />
          </View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>JohnDoes@example.com</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsCard}>
          <StatRow label="AI assistance" value="15%" />
          <StatRow label="Code without AI" value="40%" />
          <StatRow label="Projects" value="9" />
          <StatRow label="Completed projects/tasks" value="3" noBorder />
        </View>
      </View>

      <View style={styles.bottomNav}>
        <NavItem icon="home-outline" label="Home" onPress={() => router.replace('/client/clienthome')} />
        <NavItem icon="book-outline" label="Learn" onPress={() => router.replace('/client/learn')} />
        <NavItem icon="settings-outline" label="Settings" onPress={() => router.push('/client/settings')} />
        <NavItem icon="person" label="Account" active onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

const StatRow = ({ label, value, noBorder }: any) => (
  <View style={[styles.statRow, !noBorder && styles.statBorder]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
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
  header: { alignItems: 'center', paddingVertical: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  content: { paddingHorizontal: 20 },
  profileSection: { alignItems: 'center', marginBottom: 30 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E1E8ED', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  email: { fontSize: 14, color: '#666', marginBottom: 20 },
  actionButtons: { flexDirection: 'row', gap: 15 },
  editButton: { backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 20, borderWidth: 1, borderColor: '#007AFF' },
  editButtonText: { color: '#007AFF', fontWeight: '600' },
  logoutButton: { backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 20, borderWidth: 1, borderColor: '#FF3B30' },
  logoutButtonText: { color: '#FF3B30', fontWeight: '600' },
  statsCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15 },
  statBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  statLabel: { fontSize: 14, color: '#333' },
  statValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#F0F2F5', justifyContent: 'space-around', paddingBottom: 30 },
  navItem: { alignItems: 'center' },
  navLabel: { fontSize: 12, color: '#999', marginTop: 4 },
});

