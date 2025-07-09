import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert 
} from 'react-native';
import { auth } from '../../lib/firebaseConfig';

const backendAPI = "http://localhost:8000";
// All the sports options are from the Survey Page to match the firebase database sports. 
const sportsOptions = [
  "Basketball", "Soccer", "Tennis", "Swimming",
  "Running", "Volleyball", "Weightlifting", "Cycling",
  "Badminton", "Pickleball", "Table Tennis", "Football",
];

// Same structure as the survey page.
export default function UpdateSports({ route, navigation }) {
  const { userId, currentSports, refreshProfile } = route.params;
  const [selectedSports, setSelectedSports] = useState(currentSports);
  // toggle for the selecting the sport options. 
  const toggleSport = (sport) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter(s => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };
   // Saving the updated sports selections.
  const saveSports = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not authenticated");

      const token = await currentUser.getIdToken();
      // Calling the backend API endpoints to save the changed sports selections. 
      const response = await fetch(`${backendAPI}/users/${userId}/sports`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sports: selectedSports })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update sports');
      }

      Alert.alert("Success", "Sports updated");
      // refreshProfile();
      // navigation.goBack();
      refreshProfile();
      navigation.navigate("Home", { refreshMatches: true });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select Your Sports</Text>
      <View style={styles.buttonGrid}>
        {sportsOptions.map(sport => (
          <TouchableOpacity
            key={sport}
            onPress={() => toggleSport(sport)}
            style={[
              styles.sportButton,
              selectedSports.includes(sport) && styles.sportButtonSelected
            ]}
          >
            <Text style={[
              styles.sportButtonText,
              selectedSports.includes(sport) && styles.sportButtonTextSelected
            ]}>
              {sport}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveSports}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sportButton: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#3B82F6', margin: 4 },
  sportButtonSelected: { backgroundColor: '#3B82F6' },
  sportButtonText: { color: '#3B82F6' },
  sportButtonTextSelected: { color: 'white' },
  saveButton: { marginTop: 20, backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold' }
});
