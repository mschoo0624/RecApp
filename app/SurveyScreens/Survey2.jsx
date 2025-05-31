import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const sportOptions = [
  "Basketball",
  "Soccer",
  "Tennis",
  "Swimming",
  "Running",
  "Volleyball",
  "Weightlifting",
  "Cycling",
  "Badminton",
  "Pickleball",
  "Table Tennis",
  "Football",
];

export default function SurveyPage2() {
  const navigation = useNavigation();
  const route = useRoute();

  const { age, weight, gymLevel } = route.params;
  const [selectedSports, setSelectedSports] = useState([]);

  // ✅ Toggle a sport on/off
  const toggleSport = (sport) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter((item) => item !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  // ✅ Proceed to SurveyPage3 with selected data
  const handleNext = () => {
    if (selectedSports.length === 0) {
      Alert.alert("Please select at least one sport.");
      return;
    }

    navigation.navigate("SurveyPage3", {
      age,
      weight,
      gymLevel,
      sports: selectedSports,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Survey Page 2</Text>
      <Text style={styles.subtitle}>Select your preferred sports:</Text>

      <View style={styles.optionsContainer}>
        {sportOptions.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[
              styles.optionButton,
              selectedSports.includes(sport) && styles.selectedOption,
            ]}
            onPress={() => toggleSport(sport)}
          >
            <Text
              style={[
                styles.optionText,
                selectedSports.includes(sport) && styles.selectedOptionText,
              ]}
            >
              {sport}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  optionButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 8,
  },
  selectedOption: {
    backgroundColor: "#0066CC",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
  },
  selectedOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  nextButton: {
    backgroundColor: "#0066CC",
    padding: 14,
    borderRadius: 12,
    marginTop: 32,
    alignItems: "center",
    alignSelf: "center",
    width: "60%",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
