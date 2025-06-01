import React, { useState } from "react";
// Import required components from React Native
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
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
  const { age, weight, gymLevel, sports } = route.params; // getting the data from the prev pages. 
  // State to track the selected workout goal
  const [selectedGoal, setSelectedGoal] = useState("");

  // At least one of the goal options should be selected.
  const handleGoal = async () => {
    // Validate that a goal has been selected
    if (!selectedGoal) {
      Alert.alert("Missing info", "Please select a workout goal.");
      return;
    }

    // Checks whether there is a currently authenticated user in Firebase Authentication.
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    try {
      // Save or update data in Firebase Firestore under unique users.
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        // Store user preferences in a nested object
        preferences: {
          age,
          weight,
          gymLevel,
          sports,
          workoutGoal: selectedGoal,
        },
        surveyCompleted: true, // Add this flag to track survey completion
        createdAt: new Date(), // Timestamp when data was saved
      });

      // Navigate to completion screen after successful save
      navigation.navigate("SurveyComplete");
    } catch (error) {
      // Handle and display any errors that occur during save
      console.error("Error saving to Firestore:", error);
      Alert.alert("Error", "Could not save your data.");
    }
  };

  return (
    // Background image container for the survey page
    <ImageBackground
      source={require("../../assets/images/surveypage.png")}
      style={styles.background}
    >
      {/* Main content container with semi-transparent background */}
      <View style={styles.container}>
        <Text style={styles.title}>Select your workout</Text>

        {/* Map through workout options to create selection buttons */}
        {workoutOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedGoal === option && styles.selectedOption, // Highlight selected option
            ]}
            onPress={() => setSelectedGoal(option)}
          >
            <Text
              style={[
                styles.optionText,
                selectedGoal === option && styles.selectedOptionText, // Change text color for selected option
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Finish button to submit survey */}
        <TouchableOpacity style={styles.finishButton} onPress={handleGoal}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

// Styles for the survey page components
const styles = StyleSheet.create({
  // Background image styling
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  // Main container styling with semi-transparent background
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 24,
    justifyContent: "center",
    borderRadius: 16,
    margin: 16,
  },
  // Page title styling
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FF0000",
    marginBottom: 24,
  },
  // Workout option button styling
  optionButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  // Selected option button styling
  selectedOption: {
    backgroundColor: "#0066CC",
  },
  // Option text styling
  optionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  // Selected option text styling
  selectedOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // Finish button styling
  finishButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 30,
    alignItems: "center",
  },
  // Finish button text styling
  finishButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});