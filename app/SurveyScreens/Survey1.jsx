import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function SurveyPage1() {
  const navigation = useNavigation();
  const route = useRoute();

  const [userData, setUserData] = useState({
    fullName: route?.params?.fullName || "",
    email: route?.params?.email || "",
    phoneNumber: route?.params?.phoneNumber || "",
  });

  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [gymLevel, setGymLevel] = useState("");
  const [heightFt, setHeightFt] = useState(5);
  const [heightInch, setHeightInch] = useState(0);

  const handleSubmit = () => {
    if (!gymLevel || !age || !weight) {
      console.log("Error", "Please complete all fields.");
      return;
    }

    const ageNum = parseInt(age);
    if (ageNum < 18 || ageNum > 100) {
      Alert.alert("Error", "Age must be between 18 and 100");
      return;
    }

    const weightNum = parseInt(weight);
    if (weightNum < 50 || weightNum > 500) {
      Alert.alert("Error", "Weight must be between 50 and 500 lbs");
      return;
    }

    const formData = {
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      age: ageNum.toString(),
      weight: weightNum.toString(),
      gymLevel,
      height: `${heightFt} ft ${heightInch} in`,
    };

    navigation.navigate("SurveyPage2", formData);
  };

  return (
    <Animatable.View animation="fadeInUp" duration={700} style={styles.container}>
      <Text style={styles.title}>Survey Page 1</Text>

      {/* Age Input */}
      <Animatable.View animation="fadeIn" delay={100}>
        <TextInput
          style={styles.input}
          placeholder="Age"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={age}
          onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ""))}
        />
      </Animatable.View>

      {/* Weight Input */}
      <Animatable.View animation="fadeIn" delay={200}>
        <TextInput
          style={styles.input}
          placeholder="Weight (lbs)"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={weight}
          onChangeText={(text) => setWeight(text.replace(/[^0-9]/g, ""))}
        />
      </Animatable.View>

      {/* Height Section */}
      <Text style={styles.subtitle}>Height:</Text>
      <View style={styles.heightContainer}>
        {/* Feet */}
        <View style={styles.heightBox}>
          <Text style={styles.heightLabel}>Feet</Text>
          <View style={styles.incrementDecrementContainer}>
            <TouchableOpacity onPress={() => setHeightFt(Math.max(4, heightFt - 1))} style={styles.incrementDecrementButton}>
              <Text style={styles.incrementDecrementText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.heightValue}>{heightFt}</Text>
            <TouchableOpacity onPress={() => setHeightFt(Math.min(7, heightFt + 1))} style={styles.incrementDecrementButton}>
              <Text style={styles.incrementDecrementText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inches */}
        <View style={styles.heightBox}>
          <Text style={styles.heightLabel}>Inches</Text>
          <View style={styles.incrementDecrementContainer}>
            <TouchableOpacity onPress={() => setHeightInch(Math.max(0, heightInch - 1))} style={styles.incrementDecrementButton}>
              <Text style={styles.incrementDecrementText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.heightValue}>{heightInch}</Text>
            <TouchableOpacity onPress={() => setHeightInch(Math.min(11, heightInch + 1))} style={styles.incrementDecrementButton}>
              <Text style={styles.incrementDecrementText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Gym Level Options */}
      <Text style={styles.subtitle}>Select your gym level:</Text>
      {["Beginner", "Intermediate", "Advanced"].map((level, idx) => (
        <TouchableOpacity
          key={level}
          style={[styles.optionButton, gymLevel === level && styles.selectedOption]}
          onPress={() => setGymLevel(level)}
        >
          <Text style={[styles.optionText, gymLevel === level && styles.selectedOptionText]}>
            {level}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Next Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Next</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#FF0000",
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 10,
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    color: "#000",
  },
  heightContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  heightBox: {
    alignItems: "center",
    flex: 1,
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
    marginHorizontal: 10,
  },
  incrementDecrementText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  heightValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  optionButton: {
    backgroundColor: "#eee",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#0066CC",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#0066CC",
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
