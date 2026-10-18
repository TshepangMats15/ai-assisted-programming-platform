import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const iconGlyphs: Record<string, string> = {
  notifications: '🔔',
  'caret-down': '⌄',
  'stats-chart': '▥',
  'school-outline': '▱',
  'hardware-chip-outline': '▦',
  'megaphone-outline': '◁',
  'document-text-outline': '▤',
  'bar-chart-outline': '▥',
  'clipboard-outline': '▣',
  'warning-outline': '⚠',
  'settings-outline': '⚙',
  school: '▱',
  'clipboard-text': '▣',
  robot: '◉',
  'format-list-checks': '☷',
};

const Icon = ({ name, size, color, style }: { name: string; size: number; color: string; style?: any }) => (
  <Text style={[{ fontSize: size, color, lineHeight: size + 2 }, style]}>{iconGlyphs[name] ?? '•'}</Text>
);

const Ionicons = Icon;
const MaterialCommunityIcons = Icon;

export default function AdminDashboard() {
  const router = useRouter();

  const handleMenuPress = (section: string) => {
    if (section === 'Students') {
      router.push('/students');
    } else if (section === 'Announcement') {
      router.push('/announcements');
    } else {
      Alert.alert(section, 'This section is not available yet.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerBackground}>
        <View style={styles.headerTop}>
          <Text style={styles.brandText}>DevMate</Text>
          <TouchableOpacity style={styles.adminProfile} onPress={() => router.replace('/adminindex')}>
            <Ionicons name="notifications" size={20} color="#FFF" style={styles.bellIcon} />
            <Text style={styles.adminText}>Admin</Text>
            <Ionicons name="caret-down" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerTitles}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <Text style={styles.dashboardSubtitle}>Welcome Back, Admin</Text>
        </View>
      </View>

      {/* Split Layout */}
      <View style={styles.mainContent}>
        
        {/* Left Side Menu */}
        <View style={styles.sidebar}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/icon.png')} 
              style={styles.sidebarLogo} 
              resizeMode="contain" 
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarScroll}>
            <MenuSection title="Menu" />
            <TouchableOpacity>
              <MenuItem icon="school-outline" label="Students" onPress={() => router.push("/students")} />
            </TouchableOpacity>
            <MenuItem icon="hardware-chip-outline" label="AI Usage" onPress={() => router.push('/ai-usage')} />
            <MenuItem icon="megaphone-outline" label="Announcement" onPress={() => router.push("/announcements")} />

            <MenuSection title="Manage" />
            <MenuItem icon="document-text-outline" label="Results" onPress={() => router.push("/results")} />
            <MenuItem icon="bar-chart-outline" label="Reports" onPress={() => router.push("/reports")} />
            <MenuItem icon="clipboard-outline" label="Task & Marks" onPress={() => router.push("/tasks-and-marks")} />
{/* Add settings menu items */}
            <MenuSection title="Settings" />
            <MenuItem icon="warning-outline" label="Challenges" onPress={() => router.push("/challenges")} />
            <MenuItem icon="settings-outline" label="Settings" onPress={() => handleMenuPress("Settings")} />
          </ScrollView>
        </View>

        {/* Right Side Student Data */}
        <View style={styles.dashboardData}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.dataScroll}>
            
            <View style={styles.metricsGrid}>
              <MetricCard title="Students" value="245" icon="school" color="#007AFF" />
              <MetricCard title="Avg Mark" value="72%" icon="clipboard-text" color="#10B981" />
              <MetricCard title="AI Usage" value="68%" icon="robot" color="#A855F7" />
              <MetricCard title="Tasks" value="18" icon="format-list-checks" color="#F59E0B" />
            </View>

            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Student Performance</Text>
              <View style={styles.chartPlaceholder}>
                <Ionicons name="stats-chart" size={48} color="#007AFF" style={styles.chartIcon} />
                <Text style={styles.chartPlaceholderText}>Performance metrics chart will render here.</Text>
              </View>
            </View>
            
          </ScrollView>
        </View>

      </View>
    </SafeAreaView>
  );
}

// Reusable UI parts
const MenuSection = ({ title }: { title: string }) => (
  <View style={styles.menuSectionHeader}>
    <Text style={styles.menuSectionTitle}>{title}</Text>
    <View style={styles.menuSectionLine} />
  </View>
);

const MenuItem = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={20} color="#333" />
    <Text style={styles.menuItemText} numberOfLines={1}>{label}</Text>
  </TouchableOpacity>
);

const MetricCard = ({ title, value, icon, color }: any) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricTitle}>{title}</Text>
    <View style={[styles.metricInner, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={24} color="#FFF" />
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  </View>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerBackground: {
    backgroundColor: '#007AFF',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  adminProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bellIcon: {
    marginRight: 6,
  },
  adminText: {
    color: '#FFF',
    fontWeight: '600',
    marginRight: 4,
  },
  headerTitles: {
    alignItems: 'center',
  },
  dashboardTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dashboardSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    marginTop: -20, // Pulls content up over the blue header curve slightly
    paddingHorizontal: 10,
  },
  sidebar: {
    flex: 0.4, // Takes up 40% of screen width
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginRight: 10,
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  sidebarLogo: {
    width: 60,
    height: 60,
    tintColor: '#007AFF', // Tints the DevMate star logo blue
  },
  sidebarScroll: {
    paddingBottom: 20,
  },
  menuSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    marginRight: 8,
  },
  menuSectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F2F5',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  dashboardData: {
    flex: 0.6, // Takes up 60% of screen width
  },
  dataScroll: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricCard: {
    width: '100%', 
    backgroundColor: '#F0F2F5',
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  metricInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  chartSection: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chartPlaceholder: {
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  chartIcon: {
    opacity: 0.2,
    marginBottom: 10,
  },
  chartPlaceholderText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
});