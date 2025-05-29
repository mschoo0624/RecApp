import React from "react";
import { StyleSheet, View } from "react-native";
import LogIn from './LoginPage/LogInPage'; // Connecting the main functionality .jsx file

export default function App() {
  return (
    <View style={styles.container}>
      <LogIn />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});