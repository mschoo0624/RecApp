import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore"; // Add this line
import { auth, db } from "../../lib/firebaseConfig"; // Changed this line
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Added for back button

export default function SignUpPage() {
  const navigation = useNavigation(); // added
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState(""); // Added state for full name
  const [phoneNumber, setPhoneNumber] = useState(""); // Added state for phone number

  const handleSignUp = async () => {
    // Validate inputs
    if (!email.endsWith("@uic.edu")) {
      Alert.alert("Error", "Only @uic.edu emails are allowed");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!fullName.trim()) {
      Alert.alert("Error", "Full Name is required");
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Phone Number is required");
      return;
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user data in Firestore
      const userData = {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        createdAt: new Date(),
        surveyCompleted: false
      };

      // Store in Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      // Navigate to survey
      navigation.replace("SurveyPage1", {
        fullName: userData.fullName,
        email: userData.email,
        phoneNumber: userData.phoneNumber
      });

    } catch (error) {
      console.error("Sign up error:", error);
      Alert.alert(
        "Sign Up Failed", 
        error.message || "Please try again later"
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <Text style={styles.title}>Sign Up</Text>

      {/* Full Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#888"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      {/* Phone Number Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="(123) 456-7890"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>UIC Email</Text>
        <TextInput
          style={styles.input}
          placeholder="example@uic.edu"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Create a password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter your password"
          placeholderTextColor="#888"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderColor: "#FFF",
    paddingBottom: 10,
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#FFF",
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    backgroundColor: "#0066CC",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
