import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  } from 'react-native';
  import Modal from 'react-native-modal';
  import axios from 'axios';
  import { useNavigation } from '@react-navigation/native';


//const NETWORK_URL = 'http://192.168.1.7:3000/resetpass ';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [FillallfieldsModalVisible, setFillallfieldsModalVisible] = useState(false)
  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const showFillallfieldsModal= () => {
    setFillallfieldsModalVisible(true);
  };

  const hideFillallfieldsModal = () => {
    setFillallfieldsModalVisible(false);
  };

  const showSuccessModal = () => {
    setSuccessModalVisible(true);
  };

  const hideSuccessModal = () => {
    setSuccessModalVisible(false);
  };

  const showErrorModal = (message) => {
    //responseMessage(message);
    setErrorModalVisible(true);
  };

  const hideErrorModal = () => {
    setErrorModalVisible(false);
  };

  const handleResetPassword = async () => {
    console.log('Reset Password button pressed for email:', email);

    if (email.trim() === '') {
      console.log('Please fill in all required fields.');
      showFillallfieldsModal();
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(email)) {
    console.log('Invalid email format');
    showErrorModal();
    return;
    }

    try {
      const response = await axios.post(`${apiURL}/resetpass`, {
        email,
      });

      if (response.data.success) {
        Alert.alert('Password Reset', 'Password reset instructions sent to your email.');
        navigation.navigate('Login'); // Navigate to the login screen
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      Alert.alert('Error', 'An error occurred during password reset.');
    }
   };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={(text) => setEmail(text)}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>

      <Modal isVisible={errorModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Email format is wrong.</Text>
          <TouchableOpacity style={styles.modalButton} onPress={hideErrorModal}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isVisible={successModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>The verification is sent to your email.</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => {
            setSuccessModalVisible(false);
            resetInputFields();
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E74A3B',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: 'white',
    width: '80%',
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#E74A3B',
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

export default ResetPasswordPage;
