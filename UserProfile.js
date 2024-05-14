import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UserProfile = () => {
  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL || 'http://localhost:3000'; // Ensure a fallback URL
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`${apiURL}/userProfile`)
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
      });
  }, [apiURL]);

  const handleBackToMainMenu = () => {
    if (user && user.position) {
      switch (user.position) {
        case 'CVO':
        case 'Rabdash':
          navigation.navigate('VetMenu');
          break;
        case 'Private Veterinarian':
          navigation.navigate('MainMenu');
          break;
        default:
          console.warn('Unknown user position:', user.position);
          break;
      }
    } else {
      console.warn('User position is undefined');
    }
  };

  const handleResetPassword = () => {
    navigation.navigate('ResetPasswordPage');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToMainMenu}>
          <Icon name="arrow-back" size={25} color="white" />
        </TouchableOpacity>
      </View>
      {user ? (
        <View style={styles.userInfoContainer}>
          <Text style={styles.header}>User Profile</Text>
          <Image 
            source={require('./assets/avatar.png')} // Ensure this path is correct
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{`${user.name || ''} ${user.last_name || ''}`}</Text>

          <View style={styles.infoRow}>
            <Icon name="person" size={20} color="#E74A3B" style={styles.icon} />
            <Text style={styles.text}>{`${user.name || ''}`}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="person-outline" size={20} color="#E74A3B" style={styles.icon} />
            <Text style={styles.text}>{`${user.last_name || ''}`}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="email" size={20} color="#E74A3B" style={styles.icon} />
            <Text style={styles.text}>{user.email || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="work" size={20} color="#E74A3B" style={styles.icon} />
            <Text style={styles.text}>{user.position || 'N/A'}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleBackToMainMenu}>
            <Text style={styles.buttonText}>Main Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ActivityIndicator size="large" color="#3498db" />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E74A3B',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 30,
  },
  userInfoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
    width: '90%',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2c3e50',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    color: '#34495e',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 15,
    marginTop: 20,
    width: '60%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserProfile;
