import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';  // Import the useAuth hook
import Modal from 'react-native-modal';
import axios from 'axios';
import styles from './styles/login';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigation = useNavigation();
  const [responseMessage, setResponseMessage] = useState('');

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [invalidModalVisible, setInvalidModalVisible] = useState(false)
  const [FillallfieldsModalVisible, setFillallfieldsModalVisible] = useState(false)

  const { login } = useAuth();  // Use the useAuth hook

  const apiURL = process.env.EXPO_PUBLIC_URL;

  const showFillallfieldsModal= () => {
    setFillallfieldsModalVisible(true);
  };

  const hideFillallfieldsModal = () => {
    setFillallfieldsModalVisible(false);
  };

  const showInvalidModal = () => {
    setInvalidModalVisible(true);
  };

  const hideInvalidModal = () => {
    setInvalidModalVisible(false);
  };

  const showErrorModal = (message) => {
    setResponseMessage(message);
    setErrorModalVisible(true);
  };

  const hideErrorModal = () => {
    setErrorModalVisible(false);
  };

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      console.log('Please fill in all required fields.');
      showFillallfieldsModal();
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(email)) {
    console.log('Invalid email format');
    showInvalidModal();
    return;
  }

    try {
      // Your login logic here
      console.log('Login button pressed!');
      console.log('Request Payload:', { email, password });

      const response = await axios.post(`${apiURL}/login`, { email, password });
      console.log('Request Payload:', response.data);
      if (response.data.success) {
        console.log('Login successful');
        navigation.navigate('MainMenu');
        
        const position = response.data.position;

        if (position === 'CVO' || position === 'Rabdash') {
          navigation.navigate('VetMenu');
        } else if (position === 'Private Veterinarian') {
          navigation.navigate('MainMenu');
        } else {
          console.warn('Unknown user position:', position);
        }

        // Clear the email and password fields
        setEmail('');
        setPassword('');
      } else {
        showInvalidModal();  //Invalid email or password (hulaan mo saan)
      }
    } catch (error) {
      console.error('An error occurred during login:', error);
      showErrorModal();
    }
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic here
    console.log('Forgot Password link pressed!');
    navigation.navigate('ResetPassword');
  };

  const handleRegister = () => {
    // Navigate to the RegisterPage
    navigation.navigate('Register');
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Image
        source={require('./assets/logo.png')} // Replace with your image file path
        style={styles.image}
      />
      <Text style={styles.header}>Rabdash Mobile Application</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordInputContainer}>
      <TextInput
        style={styles.passwordInput}
        placeholder="Password"
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError(false);
        }}
        value={password}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity
        onPress={togglePasswordVisibility}
        style={styles.visibilityButton}
      >
        <Text style={styles.visibilityButtonText}>
          {showPassword ? 'Hide' : 'Show'}
        </Text>
      </TouchableOpacity>
    </View>

      {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      <TouchableOpacity style={styles.forgotPasswordLink} onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerLink} onPress={handleRegister}>
        <Text style={styles.registerText}>Register</Text>
      </TouchableOpacity>

      <Modal isVisible={errorModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>An error occurred during logging in.</Text>
          <TouchableOpacity style={styles.modalButton} onPress={hideErrorModal}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isVisible={invalidModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Invalid email or password (hulaan mo saan)</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => {
            setInvalidModalVisible(false);
          }}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
          </View>
      </Modal>

      <Modal isVisible={FillallfieldsModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Please fill in all required fields</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => {
            setFillallfieldsModalVisible(false);
          }}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
          </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;