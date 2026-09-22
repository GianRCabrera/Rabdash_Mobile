import React, { useState } from 'react';
import { View, Text, Image, KeyboardAvoidingView, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { AppButton, AppInput, AppModal } from '../components';
import { colors, spacing, typography } from '../theme/theme';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigation = useNavigation();
  const { dispatch } = useAuth();
  const [responseMessage, setResponseMessage] = useState('');

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [invalidModalVisible, setInvalidModalVisible] = useState(false);
  const [FillallfieldsModalVisible, setFillallfieldsModalVisible] = useState(false);

  const apiURL = process.env.EXPO_PUBLIC_URL;

  const showFillallfieldsModal = () => setFillallfieldsModalVisible(true);
  const hideFillallfieldsModal = () => setFillallfieldsModalVisible(false);
  const showInvalidModal = () => setInvalidModalVisible(true);
  const hideInvalidModal = () => setInvalidModalVisible(false);
  const showErrorModal = (message) => {
    setResponseMessage(message);
    setErrorModalVisible(true);
  };
  const hideErrorModal = () => setErrorModalVisible(false);

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

    setIsLoggingIn(true);
    try {
      console.log('Login button pressed!');
      console.log('Request Payload:', { email });

      const response = await axios.post(`${apiURL}/login`, { email, password });
      console.log('Response Payload:', response.data);
      if (response.data.success) {
        console.log('Login successful');
        const position = response.data.position;

        dispatch({ type: 'LOGIN', payload: { user: { email, position } } });

        switch (position) {
          case 'CVO':
          case 'RabDash':
            navigation.navigate('VetMenu');
            break;
          case 'Private Veterinarian':
            navigation.navigate('MainMenu');
            break;
          default:
            console.warn('Unknown user position:', position);
        }

        setEmail('');
        setPassword('');
      } else {
        console.log('Invalid email or password received from server');
        showInvalidModal();
      }
    } catch (error) {
      console.error('An error occurred during login:', error);
      showErrorModal('An error occurred during login. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const eyeIcon = showPassword ? (
    <Svg viewBox="0 0 640 512" width="22" height="22" fill="#f00000">
      <Path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z" fill="#333333" />
    </Svg>
  ) : (
    <Svg viewBox="0 0 576 512" width="22" height="22" fill="#333333">
      <Path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" fill="#333333" />
    </Svg>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <StatusBar style="light" />
      <Image source={require('../../assets/logo.png')} style={styles.image} />
      <Text style={styles.title}>Rabdash DC</Text>

      <AppInput
        style={styles.field}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AppInput
        style={styles.field}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        rightIcon={eyeIcon}
        onRightIconPress={togglePasswordVisibility}
      />

      <AppButton
        title="Login"
        onPress={handleLogin}
        variant="inverse"
        style={styles.loginButton}
        loading={isLoggingIn}
      />

      <View style={styles.separator} />

      <TouchableOpacity onPress={handleForgotPassword} style={styles.linkSpacing}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleRegister} style={styles.linkSpacing}>
        <Text style={styles.linkText}>Register</Text>
      </TouchableOpacity>

      <AppModal isVisible={errorModalVisible} message={responseMessage} onBackdropPress={hideErrorModal} />
      <AppModal isVisible={invalidModalVisible} message="Invalid email or password" onBackdropPress={hideInvalidModal} />
      <AppModal
        isVisible={FillallfieldsModalVisible}
        message="Please fill in all required fields"
        onBackdropPress={hideFillallfieldsModal}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxxl,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
    color: colors.onPrimary,
    marginBottom: spacing.xxl,
  },
  field: {
    width: '100%',
  },
  loginButton: {
    width: '100%',
    marginTop: spacing.md,
  },
  separator: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginVertical: spacing.xl,
  },
  linkSpacing: {
    marginTop: spacing.md,
  },
  linkText: {
    ...typography.body,
    color: colors.onPrimary,
  },
});

export default LoginPage;
