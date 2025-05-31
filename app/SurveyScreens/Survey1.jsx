import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function SurveyPage1() {
  const navigation = useNavigation(); // Get the navigation object

  // Variables to store the user's preferences data
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [gymLevel, setGymLevel] = useState("");
  const [heightFt, setHeightFt] = useState(5); // Default height in feet
  const [heightInch, setHeightInch] = useState(0); // Default height in inches

  const handleSubmit = () => {
    if (!gymLevel || !age || !weight) {
      Alert.alert("Error", "Please complete all fields.");
      return;
    }

    navigation.navigate("SurveyPage2", {
      age,
      weight,
      gymLevel,
      height: `${heightFt} ft ${heightInch} in`, // Combine height values
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Survey Page 1</Text>

      {/* Age Input */}
      <TextInput
        style={styles.input}
        placeholder="Age"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={age}
        onChangeText={(text) => {
          const numericValue = text.replace(/[^0-9]/g, ""); // Remove non-numeric characters
          setAge(numericValue);
        }}
      />

      {/* Weight Input */}
      <TextInput
        style={styles.input}
        placeholder="Weight (lbs)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={weight}
        onChangeText={(text) => {
          const numericValue = text.replace(/[^0-9]/g, ""); // Remove non-numeric characters
          setWeight(numericValue);
        }}
      />

      {/* Height Input */}
      <Text style={styles.subtitle}>Height:</Text>
      <View style={styles.heightContainer}>
        {/* Feet Input */}
        <View style={styles.heightBox}>
          <Text style={styles.heightLabel}>Feet</Text>
          <View style={styles.incrementDecrementContainer}>
            <TouchableOpacity
              style={styles.incrementDecrementButton}
              onPress={() => setHeightFt(Math.max(0, heightFt - 1))} // Decrement feet
            >
              <Text style={styles.incrementDecrementText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.heightValue}>{heightFt}</Text>
            <TouchableOpacity
              style={styles.incrementDecrementButton}
              onPress={() => setHeightFt(heightFt + 1)} // Increment feet
            >
              <Text style={styles.incrementDecrementText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inches Input */}
        <View style={styles.heightBox}>
          <Text style={styles.heightLabel}>Inches</Text>
          <View style={styles.incrementDecrementContainer}>
            <TouchableOpacity
              style={styles.incrementDecrementButton}
              onPress={() => setHeightInch(Math.max(0, heightInch - 1))} // Decrement inches
            >
              <Text style={styles.incrementDecrementText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.heightValue}>{heightInch}</Text>
            <TouchableOpacity
              style={styles.incrementDecrementButton}
              onPress={() => setHeightInch(Math.min(11, heightInch + 1))} // Increment inches
            >
              <Text style={styles.incrementDecrementText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Gym Level Selection */}
      <Text style={styles.subtitle}>Select your gym level:</Text>
      <TouchableOpacity
        style={[styles.optionButton, gymLevel === "Beginner" && styles.selectedOption]}
        onPress={() => setGymLevel("Beginner")}
      >
        <Text style={styles.optionText}>Beginner</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.optionButton, gymLevel === "Intermediate" && styles.selectedOption]}
        onPress={() => setGymLevel("Intermediate")}
      >
        <Text style={styles.optionText}>Intermediate</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.optionButton, gymLevel === "Advanced" && styles.selectedOption]}
        onPress={() => setGymLevel("Advanced")}
      >
        <Text style={styles.optionText}>Advanced</Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    marginBottom: 12,
    color: "#000",
  },
  heightContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  heightBox: {
    alignItems: "center",
  },
  heightLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  incrementDecrementContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  incrementDecrementButton: {
    backgroundColor: "#0066CC",
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  incrementDecrementText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  heightValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  optionButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: "80%",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#0066CC",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#0066CC",
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    width: "80%",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});