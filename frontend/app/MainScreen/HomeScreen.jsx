import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Modal,
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

// Custom hook for modal animation
const useModalAnimation = () => {
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];
  const backdropOpacity = useState(new Animated.Value(0))[0];
  
  const show = useCallback(() => {
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
  }, [slideAnim, backdropOpacity]);

  const hide = useCallback((callback) => {
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
    ]).start(callback);
  }, [slideAnim, backdropOpacity]);

  return { slideAnim, backdropOpacity, show, hide };
};

// Custom hook for pan responder
const useModalPanResponder = (slideAnim, backdropOpacity, onHide) => {
  return useRef(
    PanResponder.create({
      // Decide if the pan responder should be activated (only for downward swipes)
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy > 0 && gestureState.vy > 0;
      },
      // Update the modal's position and backdrop opacity as the user drags down
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
          backdropOpacity.setValue(0.5 - (gestureState.dy / SCREEN_HEIGHT) * 0.5);
        }
      },
      // When the user releases the drag
      onPanResponderRelease: (evt, gestureState) => {
        // If dragged far enough or fast enough, close the modal
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          onHide();
        } else {
          // Otherwise, animate the modal back to its original position
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(backdropOpacity, {
              toValue: 0.5,
              useNativeDriver: true,
            })
          ]).start();
        }
      },
    })
  ).current;
};

// Chat Modal Component
const ChatModal = ({ userId, onClose }) => (
  <View style={styles.chatPlaceholder}>
    <Text style={styles.chatTitle}>Chat with User</Text>
    <Text>User ID: {userId}</Text>
    <Text style={styles.comingSoon}>Chat feature coming soon!</Text>
  </View>
);

// Unified Modal Container Component
const ModalContainer = ({ 
  visible, 
  children, 
  onClose, 
  slideAnim, 
  backdropOpacity, 
  panHandlers 
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="none"
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <Animated.View 
        style={[
          styles.backdrop,
          { 
            opacity: backdropOpacity,
            zIndex: 1
          }
        ]}
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.modalContent,
          { 
            transform: [{ translateY: slideAnim }],
            zIndex: 2
          }
        ]}
        {...panHandlers}
      >
        <View style={styles.modalHeader}>
          <View style={styles.modalHandle} />
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        {children}
      </Animated.View>
    </View>
  </Modal>
);

export default function HomeScreen() {
  const navigation = useNavigation(); // Changing the Screens. 
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  // Modal states
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);

  // Profile modal hooks
  const profileModal = useModalAnimation();
  const profilePanHandlers = useModalPanResponder(
    profileModal.slideAnim,
    profileModal.backdropOpacity,
    () => hideProfileModal()
  );

  // Chat modal hooks
  const chatModal = useModalAnimation();
  const chatPanHandlers = useModalPanResponder(
    chatModal.slideAnim,
    chatModal.backdropOpacity,
    () => hideChatModal()
  );

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
        
        console.log("Debugging: Its working correctly.");
        
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

  // Function to send friend request
  const sendFriendRequest = async (toUserId) => {
    try {
      setSendingRequest(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in to send a friend request");
        return;
      }

      // Get Firebase ID token for authentication
      const token = await currentUser.getIdToken();
      
      // Prepare request body
      const requestBody = {
        from_user: currentUser.uid,
        to_user: toUserId
      };
      // Sending the friends request. 
      const response = await fetch(`${backendAPI}/friend-requests/send`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send friend request');
      }

      Alert.alert("Success", "Friend request sent successfully!");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to send friend request");
    } finally {
      setSendingRequest(false);
    }
  };

  // Shows the profile modal for the selected user with animation
  const showProfileModal = (userId) => {
    // Set the user ID to display in the modal
    setSelectedUserId(userId);           
    // Make the profile modal visible
    setProfileModalVisible(true);   
    // Start animation
    profileModal.show();
  };

  const hideProfileModal = useCallback(() => {
    profileModal.hide(() => {
      setProfileModalVisible(false);
      setSelectedUserId(null);
    });
  }, [profileModal]);

  const showChatModal = (userId) => {
    setSelectedUserId(userId);
    setChatModalVisible(true);
    chatModal.show();
  };

  const hideChatModal = useCallback(() => {
    chatModal.hide(() => {
      setChatModalVisible(false);
      setSelectedUserId(null);
    });
  }, [chatModal]);

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
        style={[styles.connectButton, { zIndex: 1 }]}
        onPress={(e) => {
          e.stopPropagation();
          // Changed to send friend request instead of opening chat
          sendFriendRequest(item.userId);
        }}
        disabled={sendingRequest}
      >
        {sendingRequest ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.connectButtonText}>Connect</Text>
        )}
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
      <ModalContainer
        visible={profileModalVisible}
        onClose={hideProfileModal}
        slideAnim={profileModal.slideAnim}
        backdropOpacity={profileModal.backdropOpacity}
        panHandlers={profilePanHandlers}
      >
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
      </ModalContainer>

      {/* Chat Modal */}
      <ModalContainer
        visible={chatModalVisible}
        onClose={hideChatModal}
        slideAnim={chatModal.slideAnim}
        backdropOpacity={chatModal.backdropOpacity}
        panHandlers={chatPanHandlers}
      >
        <ChatModal 
          userId={selectedUserId} 
          onClose={hideChatModal} 
        />
      </ModalContainer>
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
    minHeight: 250,
    justifyContent: 'space-between',
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
    flexShrink: 1,
  },
  connectButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    zIndex: 1,
    justifyContent: 'center',
    minHeight: 40,
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.7,
    maxHeight: SCREEN_HEIGHT * 0.9,
    zIndex: 2,
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