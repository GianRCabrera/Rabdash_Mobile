import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton, MenuScreen, menuStyles } from '../components';

const VetArchiveMenu = () => {
  const navigation = useNavigation();
  const navigateToSeminarFormarchive = () => navigation.navigate('IECFormArchive', undefined, { pop: true });
  const navigateToField_vacc_archives = () => navigation.navigate('Field_vacc_archives', undefined, { pop: true });
  const navigateToAnimalControlarchive = () => navigation.navigate('AnimalControlArchives', undefined, { pop: true });
  const navigateToNeuter_Form_archive = () => navigation.navigate('Neuter_Form_archive', undefined, { pop: true });
  const navigateToSample_form_archive = () => navigation.navigate('Sample_form_archive', undefined, { pop: true });
  const navigateToScheduleFormarchive = () => navigation.navigate('ScheduleFormArchive', undefined, { pop: true });
  const navigateToBudgetFormarchive = () => navigation.navigate('BudgetFormArchive', undefined, { pop: true });
  const navigateToRabiesExposureFormarchive = () => navigation.navigate('Rabies_Exposure_Form_Archive', undefined, { pop: true });
  const navigateToVetMenu = () => navigation.navigate('VetMenu', undefined, { pop: true });

  return (
    <MenuScreen title="Form Archives">
      <View style={menuStyles.row}>
        <AppButton title="Seminars/Trainings/IEC" variant="inverse" onPress={navigateToSeminarFormarchive} style={menuStyles.rowButton} />
        <AppButton title="Rabies Field Vaccination" variant="inverse" onPress={navigateToField_vacc_archives} style={menuStyles.rowButton} />
      </View>
      <View style={menuStyles.row}>
        <AppButton title="Animal Control & Rehabilitation" variant="inverse" onPress={navigateToAnimalControlarchive} style={menuStyles.rowButton} />
        <AppButton title="Neuter" variant="inverse" onPress={navigateToNeuter_Form_archive} style={menuStyles.rowButton} />
      </View>
      <View style={menuStyles.row}>
        <AppButton title="Rabies Sample Information" variant="inverse" onPress={navigateToSample_form_archive} style={menuStyles.rowButton} />
        <AppButton title="Schedule/Event" variant="inverse" onPress={navigateToScheduleFormarchive} style={menuStyles.rowButton} />
      </View>
      <View style={menuStyles.row}>
        <AppButton title="Budget" variant="inverse" onPress={navigateToBudgetFormarchive} style={menuStyles.rowButton} />
        <AppButton title="Human Rabies Exposure" variant="inverse" onPress={navigateToRabiesExposureFormarchive} style={menuStyles.rowButton} />
      </View>
      <AppButton
        title="Main Menu"
        variant="ghost"
        onPress={navigateToVetMenu}
        style={menuStyles.backButton}
        textStyle={menuStyles.backButtonText}
      />
    </MenuScreen>
  );
};

export default VetArchiveMenu;
