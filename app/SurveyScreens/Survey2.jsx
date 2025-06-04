import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  ScrollView,
  LayoutAnimation,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const sportOptions = [
  "Basketball", "Soccer", "Tennis", "Swimming",
  "Running", "Volleyball", "Weightlifting", "Cycling",
  "Badminton", "Pickleball", "Table Tennis", "Football",
];

export default function SurveyPage2() {
  const navigation = useNavigation();
  const route = useRoute();

  const { fullName = "", email = "", phoneNumber = "", age, weight, gymLevel, height } = route.params;

  const [selectedSports, setSelectedSports] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleSport = (sport) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter((item) => item !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleNext = () => {
    if (selectedSports.length === 0) {
      Alert.alert("Please select at least one sport.");
      return;
    }

    navigation.navigate("SurveyPage3", {
      fullName,
      email,
      phoneNumber,
      age,
      weight,
      gymLevel,
      sports: selectedSports,
      height,
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Select Your Preferred Sports</Text>

      <ScrollView contentContainerStyle={styles.optionsContainer}>
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
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
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
    marginTop: 24,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
