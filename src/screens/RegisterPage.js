import React, { useState } from 'react';
import { View, Text, Image, KeyboardAvoidingView, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Svg, { Path } from 'react-native-svg';
import { AppButton, AppInput, AppModal } from '../components';
import { colors, spacing, radii, typography } from '../theme/theme';

// Must match backend/app.js's SELF_REGISTERABLE_POSITIONS whitelist — this is
// just what the picker offers, the backend is the actual authority and
// validates independently, so a mismatch here fails safe (backend rejects/
// falls back) rather than open.
const SELF_REGISTERABLE_POSITIONS = ['Private Veterinarian', 'CVO'];

const RegisterPage = () => {
  const [name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setSelectedValue] = useState('Private Veterinarian');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [fillAllFieldsModalVisible, setFillAllFieldsModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const showFillAllFieldsModal = () => setFillAllFieldsModalVisible(true);
  const showErrorModal = (message) => {
    setResponseMessage(message);
    setErrorModalVisible(true);
  };

  const resetInputFields = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setSelectedValue('Private Veterinarian');
    setPassword('');
    setConfirmPassword('');
  };

  const handleRegister = async () => {
    if (
      name.trim() === '' ||
      last_name.trim() === '' ||
      email.trim() === '' ||
      position === null ||
      password.trim() === '' ||
      confirmPassword.trim() === ''
    ) {
      console.log('Please fill in all required fields.');
      showFillAllFieldsModal();
      return;
    }

    if (password !== confirmPassword) {
      setPasswordModalVisible(true);
      return;
    }

    console.log('Registration button pressed');

    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailIsValid = emailPattern.test(trimmedEmail);

    console.log(`Email validation result: ${emailIsValid} for email: ${trimmedEmail}`);

    if (!emailIsValid) {
      console.log('Invalid email format');
      showErrorModal('Invalid email format');
      return;
    }

    setIsRegistering(true);
    try {
      const response = await axios.post(`${apiURL}/registerotp`, {
        name,
        last_name,
        email: trimmedEmail,
        position,
        password,
      });

      setResponseMessage(response.data.Message);
      console.log('Registration success');
      resetInputFields();

      navigation.navigate('OTPRegistration', { name, last_name, email: trimmedEmail, position, password });
    } catch (error) {
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'An error occurred during registration.';
      showErrorModal(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const eyeIcon = (visible) =>
    visible ? (
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Image source={require('../../assets/logo.png')} style={styles.image} />
        <Text style={styles.title}>Create an Account</Text>

        <AppInput placeholder="First Name" value={name} onChangeText={setFirstName} />
        <AppInput placeholder="Last Name" value={last_name} onChangeText={setLastName} />
        <AppInput
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* PROVISIONAL (see CLAUDE.md): Private Veterinarian and CVO are both
            self-registerable; RabDash is still provisioned separately. A
            2-option segmented control avoids the dropdown-in-ScrollView
            clipping issue react-native-dropdown-picker has elsewhere in this
            app, and reads more clearly than a dropdown for a binary choice. */}
        <Text style={styles.positionLabel}>Registering as</Text>
        <View style={styles.positionToggle}>
          {SELF_REGISTERABLE_POSITIONS.map((option) => {
            const selected = position === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.positionOption, selected && styles.positionOptionSelected]}
                onPress={() => setSelectedValue(option)}
              >
                <Text style={[styles.positionOptionText, selected && styles.positionOptionTextSelected]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <AppInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          rightIcon={eyeIcon(showPassword)}
          onRightIconPress={togglePasswordVisibility}
        />

        <AppInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          rightIcon={eyeIcon(showConfirmPassword)}
          onRightIconPress={toggleConfirmPasswordVisibility}
        />

        <AppButton
          title="Register"
          onPress={handleRegister}
          variant="inverse"
          style={styles.registerButton}
          loading={isRegistering}
        />

        <View style={styles.separator} />

        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.linkText}>Already have an account? Login!</Text>
        </TouchableOpacity>
      </ScrollView>

      <AppModal isVisible={errorModalVisible} message={responseMessage} onBackdropPress={() => setErrorModalVisible(false)} />
      <AppModal
        isVisible={successModalVisible}
        message="Registration Successful!"
        onBackdropPress={() => {
          setSuccessModalVisible(false);
          resetInputFields();
        }}
      />
      <AppModal
        isVisible={fillAllFieldsModalVisible}
        message="Please fill in all required fields"
        onBackdropPress={() => setFillAllFieldsModalVisible(false)}
      />
      <AppModal
        isVisible={passwordModalVisible}
        message="The password doesn't match"
        onBackdropPress={() => setPasswordModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
  },
  image: {
    width: 130,
    height: 130,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.onPrimary,
    marginBottom: spacing.xxl,
  },
  positionLabel: {
    ...typography.label,
    color: 'rgba(255,255,255,0.85)',
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  positionToggle: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.sm,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  positionOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm - spacing.xs,
    alignItems: 'center',
  },
  positionOptionSelected: {
    backgroundColor: colors.surface,
  },
  positionOptionText: {
    ...typography.bodyStrong,
    color: colors.onPrimary,
  },
  positionOptionTextSelected: {
    color: colors.primary,
  },
  registerButton: {
    width: '100%',
    marginTop: spacing.md,
  },
  separator: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginVertical: spacing.xl,
  },
  linkText: {
    ...typography.body,
    color: colors.onPrimary,
  },
});

export default RegisterPage;
