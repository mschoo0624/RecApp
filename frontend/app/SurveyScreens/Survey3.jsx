import React, { useState, useEffect, useRef } from "react";
// Import required components from React Native
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  Modal,
  Animated,
} from "react-native";

// Import navigation and Firebase utilities
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebaseConfig";

// Array of workout options that users can choose from
const workoutOptions = [
  "Getting stronger",
  "Building endurance",
  "Getting fit",
  "Flexibility & mindfulness",
  "Moving & staying active",
];

export default function SurveyPage3() {
  // Initialize navigation hooks for routing
  const navigation = useNavigation();
  const route = useRoute();

  // Extract user data from previous survey pages
  const {
    fullName = "",
    email = "",
    phoneNumber = "",
    age,
    weight,
    gymLevel,
    sports = [],
    height,
  } = route.params;

  // State to track the selected workout goal
  const [selectedGoal, setSelectedGoal] = useState("");
  const [showModal, setShowModal] = useState(false); // ✅ modal state
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animate fade in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // At least one of the goal options should be selected.
  const handleGoal = async () => {
    if (!selectedGoal) {
      Alert.alert("Missing info", "Please select a workout goal.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        phoneNumber,
        preferences: {
          age,
          weight,
          gymLevel,
          height,
          sports,
          workoutGoal: selectedGoal,
        },
        surveyCompleted: true,
        createdAt: new Date(),
      });

      // ✅ Show modal and navigate to home after delay
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigation.navigate("Home");
      }, 2500);
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      Alert.alert("Error", "Could not save your data.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/surveypage.png")}
      style={styles.background}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Choose Your Workout Goal</Text>

        {workoutOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedGoal === option && styles.selectedOption,
            ]}
            onPress={() => setSelectedGoal(option)}
          >
            <Text
              style={[
                styles.optionText,
                selectedGoal === option && styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.finishButton} onPress={handleGoal}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ✅ Completion Modal */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>🎉 Survey Completed!</Text>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 24,
    justifyContent: "center",
    borderRadius: 16,
    margin: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FF0000",
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: "#0066CC",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  selectedOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  finishButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 30,
    alignItems: "center",
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
  },
  modalText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0066CC",
  },
});
