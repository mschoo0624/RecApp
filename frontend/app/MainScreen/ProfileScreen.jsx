import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

// Adding the backend API 
const backendAPI = "http://localhost:8000";

export default function ProfileScreen({ route, navigation }) {
  const { userId } = route.params || {};
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(false);
  
  useEffect(() => {
    // Getting the curr user data. 
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (!userId) {
          Alert.alert("Error", "No user ID provided");
          navigation.goBack();
          return;
        }

        // Fetch user profile data
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setUser(userDoc.data());
          
          // Fetch friends list after getting user data
          fetchFriendsList(userId);
        } else {
          Alert.alert("Error", "User not found");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        Alert.alert("Error", "Failed to load user profile");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, navigation]);

  // API ENDPOINT USAGE: Fetch friends list from backend
  const fetchFriendsList = async (userId) => {
    try {
      setLoadingFriends(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      // Get Firebase ID token for authentication
      const token = await currentUser.getIdToken();
      
      // API call to get friends list.
      const response = await fetch(`${backendAPI}/friends/${userId}`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch friends');
      
      const data = await response.json();
      setFriends(data.friends || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error", error.message || "Failed to load friends");
    } finally {
      setLoadingFriends(false);
    }
  };

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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render each friend item
  const renderFriendItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.friendItem}
      onPress={() => navigation.navigate('Profile', { userId: item.id })}
    >
      {item.photoURL ? (
        <Image source={{ uri: item.photoURL }} style={styles.friendImage} />
      ) : (
        <View style={styles.friendPlaceholder}>
          <Ionicons name="person" size={24} color="#666" />
        </View>
      )}
      <Text style={styles.friendName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Profile Content */}
      <View style={styles.profileContent}>
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
          {user.age && <Text style={styles.age}>Age: {user.age}</Text>}
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
        {user.sports?.length > 0 && (
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

        {/* Friends Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="people" size={20} color="#3B82F6" /> Friends
          </Text>
          
          {loadingFriends ? (
            <ActivityIndicator size="small" color="#3B82F6" style={styles.friendsLoader} />
          ) : friends.length > 0 ? (
            <FlatList
              horizontal
              data={friends}
              renderItem={renderFriendItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.friendsList}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noFriendsText}>No friends yet</Text>
          )}
        </View>
      </View>

      {/* Connect Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={styles.connectButton}
          onPress={() => navigation.navigate("Chat", { userId: userId })}
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
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  profileContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  backIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  basicInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  age: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
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
    fontSize: 14,
  },
  // Friends section styles
  friendsLoader: {
    marginVertical: 10,
  },
  friendsList: {
    paddingVertical: 5,
  },
  friendItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  friendImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  friendPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  friendName: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  noFriendsText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 10,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
});