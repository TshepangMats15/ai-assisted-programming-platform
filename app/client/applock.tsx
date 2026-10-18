import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
export default function AppLockScreen() {
 const router = useRouter();
 // State matching the mockup's selected options
 const [isAppLockOn, setIsAppLockOn] = useState(true); // Mockup shows "On" selected[span_1](start_span)[span_1](end_span)
 // Dropdown States
 const [methodOpen, setMethodOpen] = useState(false);
 const [lockMethod, setLockMethod] = useState('PIN'); // Default is PIN[span_2](start_span)[span_2](end_span)
 const methodOptions = ['PIN', 'Password', 'Fingerprint', 'Face Recognition']; //[span_3](start_span)[span_3](end_span)
 const [afterOpen, setAfterOpen] = useState(true); // Left open to match the visual mockup
 const [lockAfter, setLockAfter] = useState('After 5 minutes'); // Default is After 5 mins[span_4](start_span)[span_4](end_span)
 const afterOptions = ['Immediately', 'After 1 minute', 'After 5 minutes']; //[span_5](start_span)[span_5](end_span)
 return (
<SafeAreaView style={styles.container}>
     {/* Header */}
<View style={styles.header}>
<TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/client/clienthome'))} style={styles.backButton}>
<Ionicons name="chevron-back" size={28} color="#007AFF" />
<Text style={styles.headerTitle}>App Lock</Text>
</TouchableOpacity>
</View>
<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
       {/* Intro Text */}
<Text style={styles.descriptionText}>
         Protect your DevMate account when you&apos;re away from your device.
</Text>
       {/* Security Section */}
<Text style={styles.sectionTitle}>Security</Text>
<View style={styles.card}>
<View style={styles.settingRow}>
<Text style={styles.settingLabel}>App Lock</Text>
           {/* Custom Radio Button Group */}
<View style={styles.radioGroup}>
<TouchableOpacity style={styles.radioOption} onPress={() => setIsAppLockOn(false)}>
<Ionicons
                 name={!isAppLockOn ? "radio-button-on" : "radio-button-off"}
                 size={20}
                 color={!isAppLockOn ? "#007AFF" : "#999"}
               />
<Text style={styles.radioText}>Off</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.radioOption} onPress={() => setIsAppLockOn(true)}>
<Ionicons
                 name={isAppLockOn ? "radio-button-on" : "radio-button-off"}
                 size={20}
                 color={isAppLockOn ? "#007AFF" : "#999"} // Adapted to blue theme instead of purple
               />
<Text style={styles.radioText}>On</Text>
</TouchableOpacity>
</View>
</View>
</View>
       {/* Lock Method Section */}
<Text style={styles.sectionTitle}>Lock Method</Text>
<View style={[styles.card, styles.dropdownContainer]}>
<TouchableOpacity
           style={styles.dropdownHeader}
           onPress={() => {
             setMethodOpen(!methodOpen);
             setAfterOpen(false); // Close the other dropdown
           }}
>
<Text style={styles.dropdownSelectedText}>{lockMethod}</Text>
<View style={styles.dropdownRightAlign}>
<Text style={styles.defaultText}>Default</Text>
<Ionicons name={methodOpen ? "caret-up" : "caret-down"} size={16} color="#333" />
</View>
</TouchableOpacity>
         {/* Expandable Menu */}
         {methodOpen && (
<View style={styles.dropdownList}>
             {methodOptions.map((option, index) => (
<TouchableOpacity
                 key={index}
                 style={styles.dropdownItem}
                 onPress={() => {
                   setLockMethod(option);
                   setMethodOpen(false);
                 }}
>
<Text style={[styles.dropdownItemText, lockMethod === option && styles.dropdownItemActive]}>
                   {option}
</Text>
</TouchableOpacity>
             ))}
</View>
         )}
</View>
       {/* Lock After Section */}
<Text style={styles.sectionTitle}>Lock After</Text>
<View style={[styles.card, styles.dropdownContainer]}>
<TouchableOpacity
           style={styles.dropdownHeader}
           onPress={() => {
             setAfterOpen(!afterOpen);
             setMethodOpen(false); // Close the other dropdown
           }}
>
<Text style={styles.dropdownSelectedText}>{lockAfter}</Text>
<View style={styles.dropdownRightAlign}>
<Text style={styles.defaultText}>Default</Text>
<Ionicons name={afterOpen ? "caret-up" : "caret-down"} size={16} color="#333" />
</View>
</TouchableOpacity>
         {/* Expandable Menu */}
         {afterOpen && (
<View style={styles.dropdownList}>
             {afterOptions.map((option, index) => (
<TouchableOpacity
                 key={index}
                 style={styles.dropdownItem}
                 onPress={() => {
                   setLockAfter(option);
                   setAfterOpen(false);
                 }}
>
<Text style={[styles.dropdownItemText, lockAfter === option && styles.dropdownItemActive]}>
                   {option}
</Text>
</TouchableOpacity>
             ))}
</View>
         )}
</View>
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
   paddingBottom: 10
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
 descriptionText: { // Matches the intro text from the mockup[span_6](start_span)[span_6](end_span)
   fontSize: 15,
   color: '#666',
   marginTop: 10,
   marginBottom: 20,
   lineHeight: 22,
 },
 sectionTitle: {
   fontSize: 16,
   fontWeight: 'bold',
   color: '#333',
   marginTop: 15,
   marginBottom: 10,
   marginLeft: 5,
 },
 card: {
   backgroundColor: '#FFF',
   borderRadius: 12,
   paddingHorizontal: 15,
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 2 },
   shadowOpacity: 0.05,
   shadowRadius: 8,
   elevation: 2,
   marginBottom: 10,
 },
 settingRow: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   paddingVertical: 18
 },
 settingLabel: {
   fontSize: 16,
   fontWeight: '600',
   color: '#333'
 },
 radioGroup: {
   flexDirection: 'row',
   alignItems: 'center',
   backgroundColor: '#F5F7FA',
   borderRadius: 8,
   paddingHorizontal: 10,
   paddingVertical: 6,
 },
 radioOption: {
   flexDirection: 'row',
   alignItems: 'center',
   marginHorizontal: 10,
 },
 radioText: {
   fontSize: 14,
   color: '#333',
   marginLeft: 6,
 },
 dropdownContainer: {
   paddingHorizontal: 0,
 },
 dropdownHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   paddingVertical: 18,
   paddingHorizontal: 15,
 },
 dropdownSelectedText: {
   fontSize: 16,
   color: '#333',
   fontWeight: '500',
 },
 dropdownRightAlign: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 defaultText: {
   fontSize: 14,
   color: '#333',
   marginRight: 8,
 },
 dropdownList: {
   borderTopWidth: 1,
   borderTopColor: '#F0F2F5',
   backgroundColor: '#FAFAFC', // Slightly offset background for the expanded menu
   borderBottomLeftRadius: 12,
   borderBottomRightRadius: 12,
   paddingVertical: 5,
 },
 dropdownItem: {
   paddingVertical: 12,
   paddingHorizontal: 20,
 },
 dropdownItemText: {
   fontSize: 15,
   color: '#666',
 },
 dropdownItemActive: {
   color: '#007AFF',
   fontWeight: 'bold',
 }
});