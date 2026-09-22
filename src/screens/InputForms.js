import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { AppButton, MenuScreen, menuStyles } from '../components';

const InputForms = () => {
  const navigation = useNavigation();
  const navigateToRabies_Field_Vacc_Form = () => navigation.navigate('Rabies_Field_Vacc_Form');
  const navigateToRabies_Neuter_Form = () => navigation.navigate('Neuter_Form');
  const navigateToRabies_Sample_Information_Form = () => navigation.navigate('Rabies_Sample_Information_Form');
  const navigateToMainMenu = () => navigation.navigate('MainMenu');

  return (
    <MenuScreen title="Form Menu" backgroundImage={require('../../assets/forms_pic.png')}>
      <AppButton title="Rabies Field Vaccination Report" variant="inverse" onPress={navigateToRabies_Field_Vacc_Form} style={menuStyles.button} />
      <AppButton title="Neuter" variant="inverse" onPress={navigateToRabies_Neuter_Form} style={menuStyles.button} />
      <AppButton title="Rabies Sample Information" variant="inverse" onPress={navigateToRabies_Sample_Information_Form} style={menuStyles.button} />
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

export default InputForms;
