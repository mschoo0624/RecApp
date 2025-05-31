import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebaseConfig";

const workoutOptions = [
  "Getting stronger",
  "Building endurance",
  "Getting fit",
  "Flexibility & mindfulness",
  "Moving & staying active",
];

export default function SurveyPage3() {
  const navigation = useNavigation();
  const route = useRoute();

  const { age, weight, gymLevel, sports } = route.params;
  const [selectedGoal, setSelectedGoal] = useState("");

  const handleFinish = async () => {
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
        email: user.email,
        preferences: {
          age,
          weight,
          gymLevel,
          sports,
          workoutGoal: selectedGoal,
        },
        createdAt: new Date(),
      });

      navigation.navigate("SurveyComplete");

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
      <View style={styles.container}>
        <Text style={styles.title}>Select your workout</Text>

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

        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 28,
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
});
