import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuth } from './AuthContext';  // Import the useAuth hook
import Modal from 'react-native-modal';
import axios from 'axios';
import styles from './styles/register';

const RegisterPage = () => {
  const [name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setSelectedValue] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(true);
  const [passwordError, setPasswordError] = useState(false);
  const [open, setOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [FillallfieldsModalVisible, setFillallfieldsModalVisible] = useState(false)
  const [PasswordModalVisible, setPasswordModalVisible] = useState(false)

  const navigation = useNavigation();
  const { register } = useAuth();  // Use the useAuth hook
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const showPasswordModal= () => {
    setPasswordModalVisible(true);
  };

  const hidePasswordModal = () => {
    setPasswordModalVisible(false);
  };

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
    setResponseMessage(message);
    setErrorModalVisible(true);
  };

  const hideErrorModal = () => {
    setErrorModalVisible(false);
  };

  const resetInputFields = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setSelectedValue(null);
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
      showFillallfieldsModal();
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError(true);
      showPasswordModal();
      return;
    }

    console.log('Registration button pressed');

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(email)) {
    console.log('Invalid email format');
    showErrorModal();
    return;
    }

    try {
      const response = await axios.post(`${apiURL}/register`, {
        name,
        last_name,
        email,
        position,
        password,
      });

      setResponseMessage(response.data.Message);
      console.log('Registration success');
      showSuccessModal(); // Show the success modal
      resetInputFields(); // Clear input fields
      navigation.navigate('Login');
    } catch (error) {
      const errorMessage =
        error.response && error.response.data
          ? error.response.data
          : 'An error occurred during registration.';
      showErrorModal(errorMessage);
    }
  };

  const handleLogin= () => {
    // Handle forgot password logic here
    console.log('Login Page pressed!');
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Image source={require('./assets/logo.png')} style={styles.image} />
      <Text style={styles.header}>Create an Account</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        onChangeText={text => setFirstName(text)}
        value={name}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        onChangeText={text => setLastName(text)}
        value={last_name}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        onChangeText={text => setEmail(text)}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.dropdownContainer}>
        <DropDownPicker
          open={open}
          value={position}
          items={[
            { label: 'Private Veterinarian', value: 'Private Veterinarian' },
            { label: 'CVO', value: 'CVO' },
            { label: 'Rabdash', value: 'Rabdash' },
          ]}
          placeholder="Position" // Set the default placeholder text to "Position"
          setOpen={setOpen}
          setValue={setSelectedValue}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={text => setPassword(text)}
        value={password}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        onChangeText={text => {
          setConfirmPassword(text);
          setPasswordError(false);
        }}
        value={confirmPassword}
        secureTextEntry={confirmPasswordVisible} // Use the state to determine secureTextEntry
      />
      <TouchableOpacity
        onPress={() => setConfirmPasswordVisible(prev => !prev)}
        style={styles.visibilityButton}
      >
        <Text style={styles.visibilityButtonText}>
          {confirmPasswordVisible ? "Show" : "Hide"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      <TouchableOpacity style={styles.Loginlink} onPress={handleLogin}>
        <Text style={styles.LoginlinkText}>Already have an account? Login!</Text>
      </TouchableOpacity>

      <Modal isVisible={errorModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>An error occurred during registration.</Text>
          <TouchableOpacity style={styles.modalButton} onPress={hideErrorModal}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isVisible={successModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Registration Successful!</Text>
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
      <Modal isVisible={PasswordModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>The password doesn't match</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => {
            setPasswordModalVisible(false);
          }}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
          </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default RegisterPage;
