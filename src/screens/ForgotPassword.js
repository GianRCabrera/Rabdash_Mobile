import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppButton, AppInput, AppCard, AppModal } from '../components';
import { colors, spacing, typography } from '../theme/theme';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [fillAllFieldsModalVisible, setFillAllFieldsModalVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const handleResetPassword = async () => {
    if (!email) {
      setFillAllFieldsModalVisible(true);
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(email)) {
      setErrorModalVisible(true);
      return;
    }

    setIsSending(true);
    try {
      const response = await axios.post(`${apiURL}/resetpass`, { email });
      if (response.data.success) {
        setSuccessModalVisible(true);
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error during password reset:', error.message);
      Alert.alert('Error', 'An error occurred during password reset.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSuccessModalOkPress = () => {
    setSuccessModalVisible(false);
    // The OTP itself is only ever sent by email, never returned in the API
    // response (that would defeat the point of emailing it) — the OTP
    // screen collects it from the user, not from these nav params.
    navigation.navigate('OTP', { email });
  };

  const handleBackPress = () => navigation.navigate('Login');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      <AppCard style={styles.card}>
        <Text style={styles.header}>Forgot Password</Text>
        <AppInput
          placeholder="E-Mail Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          rightIcon={<Icon name="email-outline" size={20} color={colors.textOnSurfaceMuted} />}
        />
        <AppButton
          title="Send Password Reset Link"
          onPress={handleResetPassword}
          loading={isSending}
          style={styles.button}
        />
        <AppButton title="Back to Login" onPress={handleBackPress} variant="secondary" style={styles.button} />
      </AppCard>

      <AppModal
        isVisible={fillAllFieldsModalVisible}
        message="Please fill in all required fields."
        onBackdropPress={() => setFillAllFieldsModalVisible(false)}
      />
      <AppModal
        isVisible={errorModalVisible}
        message="Invalid email format."
        onBackdropPress={() => setErrorModalVisible(false)}
      />
      <AppModal
        isVisible={successModalVisible}
        message="Password reset link sent successfully."
        onBackdropPress={handleSuccessModalOkPress}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
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

export default ForgotPassword;
