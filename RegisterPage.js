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
import Svg, { Path } from 'react-native-svg';  // Import Svg and Path
import styles from './styles/register';

const RegisterPage = () => {
  const [name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setSelectedValue] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      showSuccessModal(); // Show the success modal only
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordVisibility1 = () => {
    setShowConfirmPassword(!showConfirmPassword);
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

      <View style={styles.passwordInputContainer}>
        <TextInput
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry={!showPassword} // Controls whether the password is visible
          />

      <TouchableOpacity onPress={togglePasswordVisibility} style={styles.visibilityButton}>
          {showPassword ? (
            // SVG for "Hide" (Eye Slash Icon)
            <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="24" height="24">
              <Path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z" fill="#000" />
            </Svg>
          ) : (
            // SVG for "Show" (Eye Icon)
            <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="24" height="24">
              <Path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" fill="#000" />
            </Svg>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.passwordInputContainer}>
        <TextInput
          placeholder="Confirm Password"
          onChangeText={text => {
            setConfirmPassword(text);
            setPasswordError(false);
          }}
          value={confirmPassword}
          secureTextEntry={!showConfirmPassword} // Controls whether the password is visible
          />
        <TouchableOpacity onPress={togglePasswordVisibility1} style={styles.visibilityButton}>
            {showPassword ? (
              // SVG for "Hide" (Eye Slash Icon)
              <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="24" height="24">
                <Path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z" fill="#000" />
              </Svg>
            ) : (
              // SVG for "Show" (Eye Icon)
              <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="24" height="24">
                <Path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" fill="#000" />
              </Svg>
            )}
        </TouchableOpacity>
      </View>

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
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setSuccessModalVisible(false);
              resetInputFields();
              navigation.navigate('Login'); // Navigate here after clicking OK
            }}
          >
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
