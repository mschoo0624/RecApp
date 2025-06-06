import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth, db } from "../../lib/firebaseConfig";

// Screens
import HomeScreen from "../MainScreen/HomeScreen";
import LoginScreen from "../Screens/LogInPage";
import SignUpPage from "../Screens/SignUpPage";
import SurveyPage1 from "../SurveyScreens/Survey1";
import SurveyPage2 from "../SurveyScreens/Survey2";
import SurveyPage3 from "../SurveyScreens/Survey3";
import DrawerNavigator from "./DrawerNavigator"; // need to replace with the homescreen 

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    signOut(auth);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

        if (userDoc.exists() && userDoc.data().surveyCompleted) {
          setUser({ ...firebaseUser, surveyCompleted: true });
        } else {
          setUser({ ...firebaseUser, surveyCompleted: false });
        }
      } catch (err) {
        console.error("Error checking Firestore:", err);
        setUser(null);
      }

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
        ) : user.surveyCompleted ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <>
            <Stack.Screen name="SurveyPage1" component={SurveyPage1} />
            <Stack.Screen name="SurveyPage2" component={SurveyPage2} />
            <Stack.Screen name="SurveyPage3" component={SurveyPage3} />
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}