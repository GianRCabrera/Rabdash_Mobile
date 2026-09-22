import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton, MenuScreen, menuStyles } from '../components';

const VetInputForms = () => {
  const navigation = useNavigation();
  const navigateToRabies_Field_Vacc_Form = () => navigation.navigate('Rabies_Field_Vacc_Form');
  const navigateToRabies_Neuter_Form = () => navigation.navigate('Neuter_Form');
  const navigateToAnimalControlForm = () => navigation.navigate('AnimalControlForm');
  const navigateToRabies_Sample_Information_Form = () => navigation.navigate('Rabies_Sample_Information_Form');
  const navigateToBudgetForm = () => navigation.navigate('BudgetForm');
  const navigateToScheduleForm = () => navigation.navigate('ScheduleForm');
  const navigateToIECForm = () => navigation.navigate('IECForm');
  const navigateToRabies_Exposure_Form1 = () => navigation.navigate('Rabies_Exposure_Form1');
  const navigateToMainMenu = () => navigation.navigate('VetMenu');

  return (
    <MenuScreen title="Forms" backgroundImage={require('../../assets/forms_pic.png')}>
      <View style={menuStyles.row}>
        <AppButton title="Rabies Field Vaccination" variant="inverse" onPress={navigateToRabies_Field_Vacc_Form} style={menuStyles.rowButton} />
        <AppButton title="Neuter" variant="inverse" onPress={navigateToRabies_Neuter_Form} style={menuStyles.rowButton} />
      </View>
      <View style={menuStyles.row}>
        <AppButton title="Animal Control Section Report" variant="inverse" onPress={navigateToAnimalControlForm} style={menuStyles.rowButton} />
        <AppButton title="Rabies Sample Information" variant="inverse" onPress={navigateToRabies_Sample_Information_Form} style={menuStyles.rowButton} />
      </View>
      <View style={menuStyles.row}>
        <AppButton title="Budget" variant="inverse" onPress={navigateToBudgetForm} style={menuStyles.rowButton} />
        <AppButton title="Schedule/Event" variant="inverse" onPress={navigateToScheduleForm} style={menuStyles.rowButton} />
      </View>
      <View style={menuStyles.row}>
        <AppButton title="Seminar/Trainings/IEC" variant="inverse" onPress={navigateToIECForm} style={menuStyles.rowButton} />
        <AppButton title="Human Rabies Exposure" variant="inverse" onPress={navigateToRabies_Exposure_Form1} style={menuStyles.rowButton} />
      </View>
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

export default VetInputForms;
