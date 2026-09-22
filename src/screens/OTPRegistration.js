import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { AppButton, AppInput, AppCard, AppModal } from '../components';
import { colors, spacing, typography } from '../theme/theme';

const OTPRegistration = ({ route, navigation }) => {
  const { email, position, password, name, last_name } = route.params;
  const [userOtp, setUserOtp] = useState('');
  const [otpSentModalVisible, setOtpSentModalVisible] = useState(true);
  const [otpSuccessModalVisible, setOtpSuccessModalVisible] = useState(false);
  const [registrationSuccessModalVisible, setRegistrationSuccessModalVisible] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const validateOTP = async () => {
    console.log(`Validating OTP for email: ${email} with OTP: ${userOtp}`);
    setIsValidating(true);
    try {
      const response = await axios.post(`${apiURL}/validate-otp-reg`, { email, otp: userOtp });
      console.log('OTP Validation Response:', response.data);
      if (response.data.success) {
        const registerResponse = await axios.post(`${apiURL}/register`, { name, last_name, email, position, password });
        console.log('Register Response:', registerResponse.data);
        if (registerResponse.data.success) {
          setRegistrationSuccessModalVisible(true);
        } else {
          Alert.alert('Error', registerResponse.data.message || 'Registration failed.');
        }
      } else {
        Alert.alert('Error', response.data.message || 'Invalid OTP!');
      }
    } catch (error) {
      console.error('Error validating OTP:', error.message);
      Alert.alert('Error', 'An error occurred during OTP validation.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleOtpSuccessModalClose = () => {
    setOtpSuccessModalVisible(false);
    navigation.navigate('Login');
  };

  const handleRegistrationSuccessModalClose = () => {
    setRegistrationSuccessModalVisible(false);
    setOtpSuccessModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AppCard style={styles.card}>
        <Text style={styles.header}>Enter OTP</Text>
        <AppInput
          placeholder="Enter OTP"
          value={userOtp}
          onChangeText={setUserOtp}
          keyboardType="numeric"
        />
        <AppButton title="Validate OTP" onPress={validateOTP} loading={isValidating} style={styles.button} />
        <AppButton title="Back" onPress={() => navigation.goBack()} variant="secondary" style={styles.button} />
      </AppCard>

      <AppModal
        isVisible={otpSentModalVisible}
        message="An OTP has been sent to your email."
        onBackdropPress={() => setOtpSentModalVisible(false)}
      />
      <AppModal
        isVisible={otpSuccessModalVisible}
        message="OTP verified successfully!"
        onBackdropPress={handleOtpSuccessModalClose}
      />
      <AppModal
        isVisible={registrationSuccessModalVisible}
        message="Registration successful!"
        onBackdropPress={handleRegistrationSuccessModalClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginTop: spacing.sm,
  },
});

export default OTPRegistration;
