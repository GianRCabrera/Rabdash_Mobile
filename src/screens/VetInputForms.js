import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton, MenuScreen, menuStyles } from '../components';

const VetInputForms = () => {
  const navigation = useNavigation();
  const navigateToRabies_Field_Vacc_Form = () => navigation.navigate('Rabies_Field_Vacc_Form', undefined, { pop: true });
  const navigateToRabies_Neuter_Form = () => navigation.navigate('Neuter_Form', undefined, { pop: true });
  const navigateToAnimalControlForm = () => navigation.navigate('AnimalControlForm', undefined, { pop: true });
  const navigateToRabies_Sample_Information_Form = () => navigation.navigate('Rabies_Sample_Information_Form', undefined, { pop: true });
  const navigateToBudgetForm = () => navigation.navigate('BudgetForm', undefined, { pop: true });
  const navigateToScheduleForm = () => navigation.navigate('ScheduleForm', undefined, { pop: true });
  const navigateToIECForm = () => navigation.navigate('IECForm', undefined, { pop: true });
  const navigateToRabies_Exposure_Form1 = () => navigation.navigate('Rabies_Exposure_Form1', undefined, { pop: true });
  const navigateToMainMenu = () => navigation.navigate('VetMenu', undefined, { pop: true });

  return (
    <MenuScreen title="Forms">
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
