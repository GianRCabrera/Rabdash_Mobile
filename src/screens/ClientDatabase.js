import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { AppButton, MenuScreen, menuStyles } from '../components';

const ClientDatabase = () => {
  const navigation = useNavigation();
  const navigateToField_vacc_archives = () => navigation.navigate('Field_vacc_archives');
  const navigateToNeuter_Form_archive = () => navigation.navigate('Neuter_Form_archive');
  const navigateToSample_form_archive = () => navigation.navigate('Sample_form_archive');
  const navigateToMainMenu = () => navigation.navigate('MainMenu');

  return (
    <MenuScreen title="Form Archives">
      <AppButton title="Rabies Field Vaccination Form Archives" variant="inverse" onPress={navigateToField_vacc_archives} style={menuStyles.button} />
      <AppButton title="Neuter Form Archives" variant="inverse" onPress={navigateToNeuter_Form_archive} style={menuStyles.button} />
      <AppButton title="Rabies Sample Information Form" variant="inverse" onPress={navigateToSample_form_archive} style={menuStyles.button} />
      <AppButton
        title="Main Menu"
        variant="ghost"
        onPress={navigateToMainMenu}
        style={menuStyles.backButton}
        textStyle={menuStyles.backButtonText}
      />
    </MenuScreen>
  );
};

export default ClientDatabase;
