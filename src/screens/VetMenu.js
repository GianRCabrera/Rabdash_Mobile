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
    navigation.navigate('Login', undefined, { pop: true });
  };

  const navigateToAboutUs = () => navigation.navigate('AboutUs', undefined, { pop: true });
  const navigateToUserProfile = () => navigation.navigate('UserProfile', undefined, { pop: true });
  const navigateToInputForms = () => navigation.navigate('VetInputForms', undefined, { pop: true });
  const navigateToVetArchiveMenu = () => navigation.navigate('VetArchiveMenu', undefined, { pop: true });
  const navigateToDownloadableForms = () => navigation.navigate('DownloadableForms', undefined, { pop: true });

  return (
    <MenuScreen title="Main Menu" badge={position}>
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
