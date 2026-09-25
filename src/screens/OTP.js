import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { AppButton, AppInput, AppCard, AppModal } from '../components';
import { colors, spacing, typography } from '../theme/theme';

const OTP = ({ route, navigation }) => {
  const { email } = route.params;
  const [userOtp, setUserOtp] = useState('');
  const [otpSuccessModalVisible, setOtpSuccessModalVisible] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const validateOTP = async () => {
    setIsValidating(true);
    try {
      const response = await axios.post(`${apiURL}/validate-otp`, { email, otp: userOtp });
      if (response.data.success) {
        setOtpSuccessModalVisible(true);
      } else {
        Alert.alert('Error', 'Invalid OTP!');
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
    navigation.navigate('ResetforgotPass', { email, previousScreen: 'OTP' });
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
        isVisible={otpSuccessModalVisible}
        message="OTP verified successfully!"
        onBackdropPress={handleOtpSuccessModalClose}
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

export default OTP;
