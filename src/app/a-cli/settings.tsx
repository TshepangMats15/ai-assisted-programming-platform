import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/client/profile'))}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
          <Text style={styles.headerTitle}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={[styles.settingRow, styles.borderBottom]}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch 
              value={notifications} 
              onValueChange={setNotifications} 
              trackColor={{ false: "#D1D5DB", true: "#007AFF" }}
            />
          </View>
          <TouchableOpacity style={[styles.settingRow, styles.borderBottom]}>
            <Text style={styles.settingLabel}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
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
  content: { paddingHorizontal: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 15, paddingHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  settingLabel: { fontSize: 16, color: '#333' },
});
