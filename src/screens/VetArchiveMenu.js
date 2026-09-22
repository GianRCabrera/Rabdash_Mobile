import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton, MenuScreen, menuStyles } from '../components';

const VetArchiveMenu = () => {
  const navigation = useNavigation();
  const navigateToSeminarFormarchive = () => navigation.navigate('IECFormArchive');
  const navigateToField_vacc_archives = () => navigation.navigate('Field_vacc_archives');
  const navigateToAnimalControlarchive = () => navigation.navigate('AnimalControlArchives');
  const navigateToNeuter_Form_archive = () => navigation.navigate('Neuter_Form_archive');
  const navigateToSample_form_archive = () => navigation.navigate('Sample_form_archive');
  const navigateToScheduleFormarchive = () => navigation.navigate('ScheduleFormArchive');
  const navigateToBudgetFormarchive = () => navigation.navigate('BudgetFormArchive');
  const navigateToRabiesExposureFormarchive = () => navigation.navigate('Rabies_Exposure_Form_Archive');
  const navigateToVetMenu = () => navigation.navigate('VetMenu');

  return (
    <MenuScreen title="Form Archives" backgroundImage={require('../../assets/archives.png')}>
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
