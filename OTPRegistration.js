import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import axios from 'axios';
import Modal from 'react-native-modal';

const OTPRegistration = ({ route, navigation }) => {
  const { email, position, password, name, last_name} = route.params;
  const [userOtp, setUserOtp] = useState('');
  const [otpSentModalVisible, setOtpSentModalVisible] = useState(true);  // Modal for OTP sent notification
  const [otpSuccessModalVisible, setOtpSuccessModalVisible] = useState(false); // Modal for OTP validation success
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const validateOTP = async () => {
    try {
      const response = await axios.post(`${apiURL}/validate-otp-reg`, { email, otp: userOtp });
      if (response.data.success) {
        const response = await axios.post(`${apiURL}/register`,{name, last_name, email, position, password})
        if (response.data.success) {
            setOtpSuccessModalVisible(true);
            
        }
      } else {
        Alert.alert('Error', 'Invalid OTP!');
      }
    } catch (error) {
      console.error('Error validating OTP:', error.message);
      Alert.alert('Error', 'An error occurred during OTP validation.');
    }
  };

  const hideOtpSentModal = () => {
    setOtpSentModalVisible(false);
  };

  const handleOtpSuccessModalClose = () => {
    setOtpSuccessModalVisible(false);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Enter OTP</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          onChangeText={setUserOtp}
          value={userOtp}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={validateOTP}>
          <Text style={styles.buttonText}>Validate OTP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Modal isVisible={otpSentModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>An OTP has been sent to your email.</Text>
          <TouchableOpacity style={styles.modalButton} onPress={hideOtpSentModal}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isVisible={otpSuccessModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>OTP verified successfully!</Text>
          <TouchableOpacity style={styles.modalButton} onPress={handleOtpSuccessModalClose}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
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
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#34495e',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '100%',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#3498db',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#E74A3B',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OTPRegistration;
