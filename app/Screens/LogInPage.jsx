import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebaseConfig";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false); // UI-only for now
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation(); // Initialize navigation hook for screen transitions.

  const handleLogin = async () => {
    if (!email.endsWith("@uic.edu")) {
      Alert.alert("Error", "Only @uic.edu emails are allowed");
      console.log("Debugging: ERORR!!!"); // Debugging.
      return;
    }

    try {
      console.log("Attempting login with:", { email: email.trim() }); // Debug log
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password); // make sure the user is signed up
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid)); // line fetches a user's document from Firestore

      if (!userDoc.exists()) { 
        Alert.alert("No account found", "Please sign up first.");
        await auth.signOut();
        return;
      }

      if (userDoc.data().surveyCompleted) {
        // Debugging. 
        console.log("Directing it to HomeScreen.");
        navigation.replace("Home");
      } else {
        console.log("Debugging You should Sign Up first!!!");
        return;
      }
    } catch (error) {
      console.error("Login error:", error.code);
    
        // Handle specific authentication errors
      switch (error.code) {
        case 'auth/wrong-password':
          console.log(
            "Incorrect Password", 
            "Please check your password and try again"
          );
          break;
        case 'auth/user-not-found':
          console.log(
            "Account Not Found", 
            "No account exists with this email. Please sign up first."
          );
          break;
        case 'auth/too-many-requests':
          console.log(
            "Too Many Attempts", 
            "Access temporarily disabled. Please try again later."
          );
          break;
        default:
          console.log("Login Failed", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email or Username</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="example@uic.edu"
          placeholderTextColor="#888"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Enter your password"
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#aaa"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Keep Me Logged In */}
      <View style={styles.row}>
        <View style={styles.switchWrapper}>
          <Switch
            value={keepLoggedIn}
            onValueChange={setKeepLoggedIn}
            trackColor={{ true: "#0066CC" }}
            thumbColor="#fff"
          />
          <Text style={styles.switchLabel}>Keep me logged in</Text>
        </View>
      </View>

      {/* Log In Button */}
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginBtnText}>Log In</Text>
      </TouchableOpacity>

      {/* Sign Up */}
      <TouchableOpacity
        style={styles.signupWrapper}
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text style={styles.signupText}>Don’t have a profile?</Text>
        <View style={styles.signupBtn}>
          <Text style={styles.signupBtnText}>Sign Up</Text>
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 32,
    borderBottomWidth: 2,
    borderColor: "#fff",
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    marginVertical: 16,
  },
  switchWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchLabel: {
    marginLeft: 10,
    color: "#ccc",
    fontSize: 14,
  },
  loginBtn: {
    backgroundColor: "#0066CC",
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loginBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupWrapper: {
    marginTop: 28,
    alignItems: "center",
  },
  signupText: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 10,
  },
  signupBtn: {
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 36,
  },
  signupBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});