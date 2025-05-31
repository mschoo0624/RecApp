import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";

// Screens
import LoginScreen from "./Screens/LogInPage";
import SignUpPage from "./Screens/SignUpPage";
import SurveyPage1 from "./SurveyScreens/Survey1";
import SurveyPage2 from "./SurveyScreens/Survey2";
import SurveyPage3 from "./SurveyScreens/Survey3";
import SurveyComplete from "./SurveyScreens/CompletePage"; // ✅ Add this
import HomeScreen from "./Screens/HomeScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpPage} />
          </>
        ) : (
          <>
            {/* Onboarding Flow */}
            <Stack.Screen name="SurveyPage1" component={SurveyPage1} />
            <Stack.Screen name="SurveyPage2" component={SurveyPage2} />
            <Stack.Screen name="SurveyPage3" component={SurveyPage3} />
            <Stack.Screen name="SurveyComplete" component={SurveyComplete} />
            {/* Main App */}
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
