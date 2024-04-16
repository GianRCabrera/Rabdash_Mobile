import React from 'react';
import { View,
  Text,
  TouchableOpacity,
  StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
//import { createStackNavigator } from '@react-navigation/stack';

const VetArchiveMenu = () => {
    const navigation = useNavigation();

      const navigateToSeminarFormarchive= () => {
        navigation.navigate('IECFormArchive')
      }

      const navigateToField_vacc_archives = () => {
        navigation.navigate('Field_vacc_archives');
      };

      const navigateToAnimalControlarchive= () => {
        navigation.navigate('AnimalControlArchives')
      }

      const navigateToNeuter_Form_archive= () => {
        navigation.navigate('Neuter_Form_archive')
      }

      const navigateToSample_form_archive= () => {
        navigation.navigate('Sample_form_archive')
      }

      const navigateToScheduleFormarchive= () => {
        navigation.navigate('ScheduleFormArchive')
      }

      const navigateToBudgetFormarchive= () => {
        navigation.navigate('BudgetFormArchive')
      }

      const navigateToWeatherFormarchive= () => {
        navigation.navigate('WeatherFormArchive')
      }

      const navigateToRabiesExposureFormarchive= () => {
        navigation.navigate('Rabies_Exposure_Form_Archive')
      }
    
      const navigateToVetMenu = () => {
        navigation.navigate('VetMenu')
      }

    return (
        <View style={styles.container}>
          <Text style={styles.header}>CVO Input History (Forms) </Text>
          <TouchableOpacity style={styles.button} onPress={navigateToSeminarFormarchive}>
            <Text style={styles.buttonText}>SEMINARS/TRAININGS/IEC Report Forms Archives</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToField_vacc_archives}>
            <Text style={styles.buttonText}>Rabies Field Vaccination Form Archives</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToAnimalControlarchive}>
            <Text style={styles.buttonText}>Animal Control and Rehabilitation Section Report Form Archives</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToNeuter_Form_archive}>
            <Text style={styles.buttonText}>Neuter Form Archives</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToSample_form_archive}>
            <Text style={styles.buttonText}>Rabies Sample Information Form Archives</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToScheduleFormarchive}>
            <Text style={styles.buttonText}>Schedule/Event Form Archives</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToBudgetFormarchive}>
            <Text style={styles.buttonText}>Budget Form Archives</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToWeatherFormarchive}>
            <Text style={styles.buttonText}>Weather Form Archives</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToRabiesExposureFormarchive}>
            <Text style={styles.buttonText}>Rabies Exposure Form Archives</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToVetMenu}>
            <Text style={styles.buttonText}>Go back to Main Menu</Text>
          </TouchableOpacity>
        </View>
      );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E74A3B',
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: 'white',
    },
    button: {
      backgroundColor: 'white',
      width: '80%',
      height: 40,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: '#E74A3B',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  
  export default VetArchiveMenu;