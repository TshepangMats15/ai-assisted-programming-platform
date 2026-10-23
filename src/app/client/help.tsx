import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HelpScreen() {
 const router = useRouter();

 return (
   <SafeAreaView style={styles.container}>
     {/* Header */}
     <View style={styles.header}>
       <TouchableOpacity
         onPress={() => (router.canGoBack() ? router.back() : router.replace('/client/clienthome'))}
         style={styles.backButton}
       >
         <Ionicons name="chevron-back" size={28} color="#007AFF" />
         <Text style={styles.headerTitle}>Help & Support</Text>
       </TouchableOpacity>
     </View>

     <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
       
       {/* Intro */}
       <Text style={styles.sectionTitle}>How Can We Help?</Text>
       <Text style={styles.descriptionText}>
         Welcome to DevMate Help & Support. Find answers to common questions, learn how to use DevMate&apos;s features, or contact our support team if you need additional assistance.
       </Text>

       {/* AI Assistant */}
       <HelpCategory 
         icon="robot-outline" 
         title="AI Assistant" 
         description="Learn how to use the AI Assistant to improve your coding experience."
         items={[
           "How to ask the AI coding questions",
           "How to explain code",
           "How to refactor code",
           "How to use AI documentation",
           "Tips for getting better AI responses"
         ]}
       />

       {/* Coding Workspace */}
       <HelpCategory 
         icon="laptop" 
         title="Coding Workspace" 
         description="Get help with creating and managing your coding projects."
         items={[
           "How to create a new project",
           "How to write and edit code",
           "How to save your projects",
           "How to access My Projects",
           "How to use AI assistance while coding"
         ]}
       />

       {/* Learning & Courses */}
       <HelpCategory 
         icon="book-open-outline" 
         title="Learning & Courses" 
         description="Learn how to get the most out of DevMate's learning features."
         items={[
           "How to enrol in a course",
           "How to access lessons",
           "How to track your progress",
           "Understanding course completion",
           "Finding programming courses"
         ]}
       />

       {/* Account & Profile */}
       <HelpCategory 
         icon="account-outline" 
         title="Account & Profile" 
         description="Get help managing your account and personal information."
         items={[
           "How to edit your profile",
           "How to change your profile photo",
           "How to update your programming level",
           "How to manage your favourite languages",
           "How to change your password"
         ]}
       />

       {/* Password & Security */}
       <HelpCategory 
         icon="lock-outline" 
         title="Password & Security" 
         description="Find assistance with account security."
         items={[
           "Forgot your password",
           "Resetting your password",
           "Didn't receive the reset email",
           "Setting up Multi-Factor Authentication",
           "Managing App Lock"
         ]}
       />

       {/* Settings */}
       <HelpCategory 
         icon="cog-outline" 
         title="Settings" 
         description="Learn how to customise your DevMate experience."
         items={[
           "Managing notifications",
           "Changing the app appearance",
           "Changing language",
           "Managing privacy settings"
         ]}
       />

       {/* FAQs */}
       <Text style={[styles.sectionTitle, { marginTop: 30, color: '#E74C3C' }]}>
         ? Frequently Asked Questions
       </Text>
       
       <FaqItem 
         question="How do I reset my password?" 
         answer="Select Forgot Password on the Login screen and follow the instructions to receive a password-reset link." 
       />
       <FaqItem 
         question="What if I don't receive the reset email?" 
         answer="Select Didn't Receive It? on the password-reset screen and choose Resend Reset Link." 
       />
       <FaqItem 
         question="How do I create a project?" 
         answer="Select New Project from the Home screen and follow the steps to create your coding workspace."
       />
     </ScrollView>
   </SafeAreaView>
 );
}

type HelpCategoryProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description: string;
  items: string[];
};

function HelpCategory({ icon, title, description, items }: HelpCategoryProps) {
  return (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeading}>
        <MaterialCommunityIcons name={icon} size={24} color="#007AFF" />
        <Text style={styles.categoryTitle}>{title}</Text>
      </View>
      <Text style={styles.descriptionText}>{description}</Text>
      {items.map((item) => (
        <View key={item} style={styles.helpItem}>
          <Text style={styles.helpItemText}>{item}</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </View>
      ))}
    </View>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <View style={styles.faqCard}>
      <Text style={styles.faqQuestion}>{question}</Text>
      <Text style={styles.faqAnswer}>{answer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 21,
    marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  categoryHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  helpItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  helpItemText: {
    color: '#555',
    flex: 1,
    marginRight: 10,
  },
  faqCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  faqQuestion: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    color: '#666',
    fontSize: 14,
    lineHeight: 21,
  },
});