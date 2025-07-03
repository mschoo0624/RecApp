import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatScreen({ route }) {
  // NEW: Get user ID from navigation
  const { userId } = route.params;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat with User</Text>
      <Text>User ID: {userId}</Text>
      <Text style={styles.comingSoon}>Chat feature coming soon!</Text>
    </View>
  );
}

// NEW: Basic chat screen styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  comingSoon: {
    marginTop: 20,
    fontStyle: 'italic',
    color: '#666'
  }
});