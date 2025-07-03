import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  ScrollView,
  TouchableOpacity,
  Alert 
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileModal({ userId, onClose, onStartChat }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        } else {
          Alert.alert("Error", "User not found");
          onClose();
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        Alert.alert("Error", "Failed to load user profile");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUser();
    }
  }, [userId, onClose]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Image */}
      <View style={styles.profileImageContainer}>
        {user.photoURL ? (
          <Image 
            source={{ uri: user.photoURL }} 
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={60} color="#666" />
          </View>
        )}
      </View>

      {/* Basic Info */}
      <View style={styles.basicInfo}>
        <Text style={styles.name}>{user.fullName || "Unknown User"}</Text>
        <Text style={styles.bio}>{user.bio || "Fitness enthusiast"}</Text>
        
        {user.age && (
          <Text style={styles.age}>Age: {user.age}</Text>
        )}
      </View>

      {/* Fitness Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="fitness" size={20} color="#3B82F6" /> Fitness Profile
        </Text>
        
        {user.preferences && (
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gym Level:</Text>
              <Text style={styles.infoValue}>
                {user.preferences.gymLevel || "Not specified"}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Workout Goal:</Text>
              <Text style={styles.infoValue}>
                {user.preferences.workoutGoal || "Not specified"}
              </Text>
            </View>
            
            {user.preferences.workoutFrequency && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Frequency:</Text>
                <Text style={styles.infoValue}>
                  {user.preferences.workoutFrequency}
                </Text>
              </View>
            )}
            
            {user.preferences.timeOfDay && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Preferred Time:</Text>
                <Text style={styles.infoValue}>
                  {user.preferences.timeOfDay}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Sports Section */}
      {user.sports && user.sports.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="basketball" size={20} color="#3B82F6" /> Sports Interests
          </Text>
          <View style={styles.sportsContainer}>
            {user.sports.map((sport, index) => (
              <View key={index} style={styles.sportTag}>
                <Text style={styles.sportText}>{sport}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Connect Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={styles.connectButton}
          onPress={onStartChat}
        >
          <Ionicons name="chatbubble-outline" size={20} color="white" />
          <Text style={styles.connectButtonText}>Start Conversation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  basicInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  age: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoGrid: {
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  sportText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 12,
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  connectButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});