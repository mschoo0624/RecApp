import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  Image,
  ActivityIndicator,
  Modal, // modal is a UI element that appears on top of the main content to capture the user's attention and interaction.
  Animated,
  Dimensions,
  PanResponder
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth, db } from "../../lib/firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
// Profile Modal Component
import ProfileModal from "../Components/ProfileModal";

// Gets the height of the indivisual device's screen.
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// Adding the backend API. 
const backendAPI = "http://localhost:8000";

export default function HomeScreen() {
  const navigation = useNavigation(); // Changing the Screens. 
  // const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Modal states
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);

  // Animation values
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];
  const backdropOpacity = useState(new Animated.Value(0))[0];

  // Fetching the current user data.
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Checking if the user is logged in correctly. 
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          // If user exists.
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load user data");
      }
    };

    fetchUserData();
  }, []);

  // Fetching the mathces from the backend code. 
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        // Checking for the current user. 
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        // Get Firebase ID token for authentication. 
        const token = await currentUser.getIdToken();
        
        // Sends the GET request to my backend APU to fetch the data for my current user.
        // @app.get("/matches/{user_id}") -> From the backend.  
        const response = await fetch(`${backendAPI}/matches/${currentUser.uid}`, {
          // sets the HTTP request header. 
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch matches');
        
        // Waits for the backend response and parses it as JSON.
        const data = await response.json();
        // and then Updates the matches. 
        setMatches(data.matches || []);
      } catch (error) {
        Alert.alert("Error", error.message || "Failed to load matches");
      } finally {
        setLoading(false);
      }
    };
    // Only fetches matches for users who have completed the survey.
    if (userData?.surveyCompleted) {
      fetchMatches();
    }
  }, [userData]);

  // Shows the profile modal for the selected user with animation
  const showProfileModal = (userId) => {
    // Set the user ID to display in the modal
    setSelectedUserId(userId);           
    // Make the profile modal visible
    setProfileModalVisible(true);   

    // Animate the modal sliding up and the backdrop fading in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,                      // Slide modal to the top (visible position)
        duration: 300,                   // Animation duration in ms
        useNativeDriver: true,           // Use native driver for better performance
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.5,                    // Fade in the backdrop to 50% opacity
        duration: 300,                   // Animation duration in ms
        useNativeDriver: true,           // Use native driver for better performance
      })
    ]).start();                          // Start both animations in parallel
  };

  const hideProfileModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      setProfileModalVisible(false);
      setSelectedUserId(null);
    });
  };

  const showChatModal = (userId) => {
    setSelectedUserId(userId);
    setChatModalVisible(true);
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const hideChatModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      setChatModalVisible(false);
      setSelectedUserId(null);
    });
  };

// Pan responder for swipe-to-close functionality on the modal
const panResponder = PanResponder.create({
  // Decide if the pan responder should be activated (only for downward swipes)
  onMoveShouldSetPanResponder: (evt, gestureState) => {
    return gestureState.dy > 0 && gestureState.vy > 0; // Only respond to downward movement
  },
  // Update the modal's position and backdrop opacity as the user drags down
  onPanResponderMove: (evt, gestureState) => {
    if (gestureState.dy > 0) {
      slideAnim.setValue(gestureState.dy); // Move the modal down by the drag distance
      backdropOpacity.setValue(0.5 - (gestureState.dy / SCREEN_HEIGHT) * 0.5); // Fade out the backdrop as modal moves
    }
  },
  // When the user releases the drag
  onPanResponderRelease: (evt, gestureState) => {
    // If dragged far enough or fast enough, close the modal
    if (gestureState.dy > 100 || gestureState.vy > 0.5) {
      hideProfileModal();
    } else {
      // Otherwise, animate the modal back to its original position
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
    },});

  // For the LogOut button logic.
  const handleLogOut = async () => {
    try {
      await signOut(auth); // Sign out the user
      Alert.alert("Success", "You have been logged out.");
      // this handles the resets the avigation state. 
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Render each match in a list.   
  const renderMatchItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.matchCard}
      onPress={() => showProfileModal(item.userId)}
    >
      <View style={styles.matchHeader}>
        {item.photoURL ? (
          <Image source={{ uri: item.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color="#666" />
          </View>
        )}
        <Text style={styles.matchName}>{item.name}</Text>
      </View>
      
      <View style={styles.matchStats}>
        <Text style={styles.matchScore}>
          Compatibility: {item.compatibilityScore}%
        </Text>
        <View style={styles.scoreBar}>
          <View 
            style={[
              styles.scoreFill, 
              { width: `${item.compatibilityScore}%` }
            ]} 
          />
        </View>
      </View>
      
      <Text style={styles.matchSports}>
        Sports: {item.sports.join(', ')}
      </Text>
      
      <TouchableOpacity 
        style={styles.connectButton}
        onPress={(e) => {
          e.stopPropagation();
          showChatModal(item.userId);
        }}
      >
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            {userData ? `Welcome, ${userData.fullName}!` : "Welcome!"}
          </Text>
          <TouchableOpacity onPress={handleLogOut}>
            <Ionicons name="log-out-outline" size={28} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        
        {!userData?.surveyCompleted ? (
          <View style={styles.surveyPrompt}>
            <Text style={styles.surveyText}>
              Complete your profile survey to get personalized matches!
            </Text>
            <TouchableOpacity 
              style={styles.surveyButton}
              onPress={() => navigation.navigate("Survey")}
            >
              <Text style={styles.surveyButtonText}>Take Survey</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Recommended Matches</Text>
            
            {loading ? (
              <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
            ) : matches.length === 0 ? (
              <Text style={styles.noMatchesText}>No matches found. Check back later!</Text>
            ) : (
              <FlatList
                horizontal
                data={matches}
                renderItem={renderMatchItem}
                keyExtractor={item => item.userId}
                contentContainerStyle={styles.matchList}
                showsHorizontalScrollIndicator={false}
              />
            )}
            
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <View style={styles.eventsPlaceholder}>
              <Text>Events will appear here</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideProfileModal}
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.backdrop,
              { opacity: backdropOpacity }
            ]}
          >
            <TouchableOpacity 
              style={styles.backdropTouch}
              onPress={hideProfileModal}
            />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={hideProfileModal}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedUserId && (
              <ProfileModal 
                userId={selectedUserId}
                onClose={hideProfileModal}
                onStartChat={() => {
                  hideProfileModal();
                  setTimeout(() => showChatModal(selectedUserId), 300);
                }}
              />
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Chat Modal */}
      <Modal
        visible={chatModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideChatModal}
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.backdrop,
              { opacity: backdropOpacity }
            ]}
          >
            <TouchableOpacity 
              style={styles.backdropTouch}
              onPress={hideChatModal}
            />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={hideChatModal}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.chatPlaceholder}>
              <Text style={styles.chatTitle}>Chat with User</Text>
              <Text>User ID: {selectedUserId}</Text>
              <Text style={styles.comingSoon}>Chat feature coming soon!</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1e293b",
  },
  matchList: {
    paddingBottom: 16,
  },
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: 280,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  matchName: {
    fontSize: 18,
    fontWeight: "600",
  },
  matchStats: {
    marginBottom: 12,
  },
  matchScore: {
    fontSize: 16,
    marginBottom: 6,
    color: "#4b5563",
  },
  scoreBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
  },
  matchSports: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  connectButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  surveyPrompt: {
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginVertical: 20,
  },
  surveyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    color: "#0369a1",
  },
  surveyButton: {
    backgroundColor: "#0ea5e9",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  surveyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 40,
  },
  noMatchesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#64748b",
    marginVertical: 20,
  },
  eventsPlaceholder: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 150,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.7,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
  },
  closeButton: {
    padding: 8,
    marginLeft: 'auto',
  },
  chatPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  chatTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  comingSoon: {
    marginTop: 20,
    fontStyle: 'italic',
    color: '#666',
  },
});

