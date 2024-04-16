import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  //const NETWORK_URL = 'http://192.168.1.211:3000/userProfile';
  //const NETWORK_URL = 'http://192.168.1.7:3000/userProfile';

  useEffect(() => {
    // Fetch user profile data from the backend
    axios.get(`${apiURL}/userProfile`)
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
        // Handle error, e.g., navigate to login screen
      });
  }, []);

  const handleBackToMainMenu = () => {
    const position = user.position;

        if (position === 'CVO' || position === 'Rabdash') {
          navigation.navigate('VetMenu');
        } else if (position === 'Private Veterinarian') {
          navigation.navigate('MainMenu');
        } else {
          console.warn('Unknown user position:', position);
        }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Profile</Text>
      {user ? (
        <View style={styles.userInfoContainer}>
          <Text style={styles.label}>First Name:</Text>
          <Text style={styles.text}>{user.name}</Text>

          <Text style={styles.label}>Last Name:</Text>
          <Text style={styles.text}>{user.last_name}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.text}>{user.email}</Text>

          <Text style={styles.label}>Position:</Text>
          <Text style={styles.text}>{user.position}</Text>
        </View>
      ) : (
        <ActivityIndicator size="large" color="#3498db" />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleBackToMainMenu}
      >
        <Text style={styles.buttonText}>Back to Main Menu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E74A3B',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  userInfoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: '#34495e',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserProfile;
