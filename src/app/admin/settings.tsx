import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import api from '../../services/api';
import { useAppTheme } from '../../context/ThemeContext';

interface Student {

  id: string;

  fullName: string;

  email: string;

  role: string;

}

export default function StudentsSettingsPage() {

  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);

  const { isDark: isDarkMode, colors, toggleTheme } = useAppTheme();

  useEffect(() => {

    fetchStudents();

  }, []);

  const fetchStudents = async () => {

    try {

      setLoading(true);

      const users = await api.users.getAll();

      const studentsList = users

        .filter((user) => String(user.role ?? '').toUpperCase() === 'STUDENT')

        .map((user, index) => ({

          id: String(user.id ?? user.uid ?? user.userId ?? `student-${index}`),

          fullName: user.fullName ?? user.full_name ?? user.name ?? 'Unnamed student',

          email: user.email ?? 'No email',

          role: String(user.role ?? 'STUDENT'),

        }));

      setStudents(studentsList);

    } catch (error: any) {

      Alert.alert('Error fetching students', error.message);

    } finally {

      setLoading(false);

    }

  };

  const upgradeToAdmin = async (studentId: string, studentName: string) => {

    Alert.alert(

      'Confirm Upgrade',

      `Are you sure you want to make ${studentName} an Admin? They will have full access to the admin dashboard.`,

      [

        { text: 'Cancel', style: 'cancel' },

        {

          text: 'Upgrade',

          style: 'destructive',

          onPress: async () => {

            try {

              const student = students.find((item) => item.id === studentId);

              if (!student) throw new Error('Student could not be found.');

              await api.users.update(studentId, {

                fullName: student.fullName,

                email: student.email,

                role: 'ADMIN',

              });

              Alert.alert('Success', `${studentName} is now an admin.`);

              setStudents((prev) => prev.filter((item) => item.id !== studentId));

            } catch (error: any) {

              Alert.alert('Error updating role', error.message);

            }

          },

        },

      ]

    );

  };

  // Generate styles based on current theme state

  const dynamicStyles = getStyles(colors, isDarkMode);

  const renderItem = ({ item }: { item: Student }) => (
<View style={dynamicStyles.card}>
<View style={dynamicStyles.infoContainer}>
<Text style={dynamicStyles.name}>{item.fullName}</Text>
<Text style={dynamicStyles.email}>{item.email}</Text>
</View>
<TouchableOpacity

        style={dynamicStyles.upgradeButton}

        onPress={() => upgradeToAdmin(item.id, item.fullName)}
>
<Text style={dynamicStyles.upgradeText}>Make Admin</Text>
</TouchableOpacity>
</View>

  );

  return (
<View style={dynamicStyles.container}>
<View style={dynamicStyles.headerContainer}>
<Text style={dynamicStyles.headerTitle}>Manage Students</Text>
<TouchableOpacity 

          style={dynamicStyles.themeButton} 

          onPress={toggleTheme}
>
<Text style={dynamicStyles.themeButtonText}>

            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
</Text>
</TouchableOpacity>
</View>

      {loading ? (
<ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 20 }} />

      ) : (
<FlatList

          data={students}

          keyExtractor={(item) => item.id}

          renderItem={renderItem}

          contentContainerStyle={dynamicStyles.listContent}

          ListEmptyComponent={<Text style={dynamicStyles.emptyText}>No students found.</Text>}

        />

      )}
</View>

  );

}

// Converted StyleSheet.create into a dynamic function

const getStyles = (colors: {
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  text: string;
  textSecondary: string;
}, isDarkMode: boolean) => StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: colors.background, 

  },

  headerContainer: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    backgroundColor: colors.backgroundElement,

    borderBottomWidth: 1,

    borderBottomColor: isDarkMode ? '#333' : '#E1E8ED',

    padding: 20,

  },

  headerTitle: {

    fontSize: 24,

    fontWeight: 'bold',

    color: isDarkMode ? '#F5F7FA' : '#333',

  },

  themeButton: {

    paddingVertical: 6,

    paddingHorizontal: 12,

    backgroundColor: colors.backgroundSelected,

    borderRadius: 20,

  },

  themeButtonText: {

    color: isDarkMode ? '#F5F7FA' : '#333',

    fontSize: 14,

    fontWeight: '600',

  },

  listContent: {

    padding: 16,

  },

  card: {

    flexDirection: 'row',

    backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',

    padding: 16,

    borderRadius: 12,

    marginBottom: 12,

    alignItems: 'center',

    justifyContent: 'space-between',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: isDarkMode ? 0.3 : 0.05,

    shadowRadius: 4,

    elevation: 2,

  },

  infoContainer: {

    flex: 1,

    paddingRight: 10,

  },

  name: {

    fontSize: 16,

    fontWeight: '600',

    color: isDarkMode ? '#F5F7FA' : '#1A1A1A',

  },

  email: {

    fontSize: 14,

    color: isDarkMode ? '#A0A0A0' : '#666',

    marginTop: 4,

  },

  upgradeButton: {

    backgroundColor: '#007BFF',

    paddingVertical: 8,

    paddingHorizontal: 14,

    borderRadius: 8,

  },

  upgradeText: {

    color: '#fff',

    fontWeight: '600',

    fontSize: 14,

  },

  emptyText: {

    textAlign: 'center',

    color: isDarkMode ? '#A0A0A0' : '#666',

    marginTop: 40,

    fontSize: 16,

  }

});
 