import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebaseConfig";

// Screens
import HomeScreen from "../MainScreen/HomeScreen";
import ProfileScreen from "../MainScreen/ProfileScreen";
import ChatScreen from "../MainScreen/ChatScreen";
import LoginScreen from "../Screens/LogInPage";
import SignUpPage from "../Screens/SignUpPage";
import SurveyPage1 from "../SurveyScreens/Survey1";
import SurveyPage2 from "../SurveyScreens/Survey2";
import SurveyPage3 from "../SurveyScreens/Survey3";
import NotificationsScreen from "../MainScreen/NotificationsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const backendAPI = "http://localhost:8000";

function MainAppTabs({ pendingCount }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications-outline" size={24} color={color} />
          ),
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
        initialParams={{ userId: auth.currentUser?.uid }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    signOut(auth); // Remove/comment out for production

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

  // Fetch pending requests count
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!auth.currentUser) {
        setPendingCount(0);
        return;
      }
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${backendAPI}/friend-requests/pending/${auth.currentUser.uid}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setPendingCount(data.count || 0);
      } catch (e) {
        setPendingCount(0);
      }
    };
    if (user && user.surveyCompleted) {
      fetchPendingCount();
    }
  }, [user]);

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
          <>
            <Stack.Screen name="Main">
              {() => <MainAppTabs pendingCount={pendingCount} />}
            </Stack.Screen>
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="SurveyPage1" component={SurveyPage1} />
            <Stack.Screen name="SurveyPage2" component={SurveyPage2} />
            <Stack.Screen name="SurveyPage3" component={SurveyPage3} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}