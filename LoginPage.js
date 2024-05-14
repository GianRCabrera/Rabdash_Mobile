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
import Svg, { Path } from 'react-native-svg';  // Import Svg and Path
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
    navigation.navigate('ForgotPassword');
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
      <Text style={styles.header}>Rabdash DC</Text>
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
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry={!showPassword} // This controls whether the password is visible
          />

        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.visibilityButton}>
          {showPassword ? (
            <Svg viewBox="0 0 640 512" width="24" height="24" fill="#f00000">
              <Path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z" fill="#333333" />
            </Svg>
          ) : (
            <Svg viewBox="0 0 576 512" width="24" height="24" fill="#333333">
              <Path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" fill="#333333" />
            </Svg>
          )}
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