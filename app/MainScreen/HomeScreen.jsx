import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation(); // Changing the Screens. 

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

  // For Profile button.
  /******************************************************************************/
  // To handle the Profile button logic. 
  const profileButton = () => {
    navigation.navigate("profile");
  };
  // setting button
  const settingButton = () => {
    navigation.navigate("settings");
  };
  /******************************************************************************/

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Home Screen!</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogOut}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});