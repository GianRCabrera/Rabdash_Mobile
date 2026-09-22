import React from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AppButton, MenuScreen, menuStyles } from '../components';

const VetMenu = () => {
  const navigation = useNavigation();
  const { state, dispatch } = useAuth();
  const apiURL = process.env.EXPO_PUBLIC_URL;
  const position = state.user.position || 'CVO / RabDash';

  const handleLogout = async () => {
    try {
      await axios.post(`${apiURL}/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Error during logout:', error.message);
    }
    dispatch({ type: 'LOGOUT' });
    navigation.navigate('Login');
  };

  const navigateToAboutUs = () => navigation.navigate('AboutUs');
  const navigateToUserProfile = () => navigation.navigate('UserProfile');
  const navigateToInputForms = () => navigation.navigate('VetInputForms');
  const navigateToVetArchiveMenu = () => navigation.navigate('VetArchiveMenu');
  const navigateToDownloadableForms = () => navigation.navigate('DownloadableForms');

  return (
    <MenuScreen title="Main Menu" badge={position} backgroundImage={require('../../assets/menu_pic.png')}>
      <AppButton title="Input Forms" variant="inverse" onPress={navigateToInputForms} style={menuStyles.button} />
      <AppButton title="Form Archives" variant="inverse" onPress={navigateToVetArchiveMenu} style={menuStyles.button} />
      <AppButton title="Downloadable Forms" variant="inverse" onPress={navigateToDownloadableForms} style={menuStyles.button} />
      <AppButton title="My Profile" variant="inverse" onPress={navigateToUserProfile} style={menuStyles.button} />
      <AppButton title="About Us" variant="inverse" onPress={navigateToAboutUs} style={menuStyles.button} />
      <AppButton
        title="Log Out"
        variant="ghost"
        onPress={handleLogout}
        style={menuStyles.backButton}
        textStyle={menuStyles.backButtonText}
      />
    </MenuScreen>
  );
};

export default VetMenu;
