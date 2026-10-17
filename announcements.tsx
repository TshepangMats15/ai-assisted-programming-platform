import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminAnnouncementsScreen() {
  const router = useRouter();

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Students');

  const audienceOptions = ['All Students', 'Java Students', 'Python Students', 'Selected Students']; //

  // Mock Data
  const [announcements, setAnnouncements] = useState([
    {
      id: '1',
      title: 'Java Assignment Deadline Extended',
      message: 'The submission deadline has been extended to 20 September 2026.',
      date: '4 September 2026',
    },
    {
      id: '2',
      title: 'New Java Intermediate Module',
      message: 'Module 5 is now available for students.',
      date: '2 September 2026',
    }
  ]);

  const handlePublish = () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("Missing Fields", "Please enter a title and message.");
      return;
    }
    // Add to list and reset form
    const newAnnouncement = {
      id: Date.now().toString(),
      title,
      message,
      date: '16 October 2026', // Current mocked date
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setTitle('');
    setMessage('');
    setTargetAudience('All Students');
    setIsCreating(false);
    Alert.alert("Success", "Announcement published to clients.");
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
          <Text style={styles.headerTitle}>Announcements</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Action Bar */}
        {!isCreating && (
          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.newButton} onPress={() => setIsCreating(true)}>
              <Text style={styles.newButtonText}>+ New Announcement</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Create Announcement Form */}
        {isCreating && (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Create Announcement</Text>
            
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput 
              style={styles.textInput}
              placeholder="Enter announcement title..." //
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.inputLabel}>Messages</Text>
            <TextInput 
              style={[styles.textInput, styles.textArea]}
              placeholder="Write your announcement.." //
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />

            {/* Target Audience Radio Group */}
            <View style={styles.audienceCard}>
              <Text style={styles.audienceLabel}>Send To:</Text>
              {audienceOptions.map((option, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.radioRow}
                  onPress={() => setTargetAudience(option)}
                >
                  <Ionicons 
                    name={targetAudience === option ? "radio-button-on" : "radio-button-off"} 
                    size={22} 
                    color={targetAudience === option ? "#007AFF" : "#999"} 
                  />
                  <Text style={styles.radioText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form Actions */}
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
                <Text style={styles.publishButtonText}>Publish</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsCreating(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Existing Announcements List */}
        {!isCreating && announcements.map((item) => (
          <View key={item.id} style={styles.announcementCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📢 {item.title}</Text>
            </View>
            <Text style={styles.cardMessage}>{item.message}</Text>
            <Text style={styles.cardDate}>Posted: {item.date}</Text>
            
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => Alert.alert("Edit", "(Under construction)")}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => Alert.alert("Delete", "(Under construction)")}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F7FA' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 15 
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333', 
    marginLeft: 5 
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  actionBar: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  newButton: {
    backgroundColor: '#007AFF', // Replaced purple with primary blue
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  newButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  announcementCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardMessage: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15,
  },
  cardDate: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 15,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30', 
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  
  /* Form Styles */
  formContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: '#333',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 120,
  },
  audienceCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  audienceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 10,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  publishButton: {
    backgroundColor: '#007AFF',
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginRight: 10,
  },
  publishButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#999',
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});