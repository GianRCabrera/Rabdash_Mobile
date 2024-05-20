import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [fillAllFieldsModalVisible, setFillAllFieldsModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
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

    try {
      const response = await axios.post(`${apiURL}/resetpass`, { email });
      if (response.data.success) {
        setOtp(response.data.otp); // Save the OTP to state
        setSuccessModalVisible(true);
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error during password reset:', error.message);
      Alert.alert('Error', 'An error occurred during password reset.');
    }
  };

  const handleSuccessModalOkPress = () => {
    setSuccessModalVisible(false);
    navigation.navigate('OTP', { email, otp }); // Navigate to OTPScreen with email and OTP
  };

  const handleBackPress = () => {
    navigation.navigate('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Forgot Password</Text>
        <View style={styles.inputGroup}>
          <Icon name="email-outline" size={24} color="#E74A3B" />
          <TextInput
            style={styles.input}
            placeholder="E-Mail Address"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Send Password Reset Link</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleBackPress}>
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>

      <Modal isVisible={fillAllFieldsModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Please fill in all required fields.</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => setFillAllFieldsModalVisible(false)}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isVisible={errorModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Invalid email format.</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => setErrorModalVisible(false)}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isVisible={successModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Password reset link sent successfully.</Text>
          <TouchableOpacity style={styles.modalButton} onPress={handleSuccessModalOkPress}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#34495e',
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#E74A3B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPassword;
