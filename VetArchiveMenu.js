import React from 'react';
import { View,
  Text,
  TouchableOpacity,
  Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/inputforms';

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
           <Image
            source={require('./assets/archives.png')} // Ensure the path is correct
            style={styles.DLbackgroundImage} // Custom styles for the image
          />
          <Text style={styles.header}>CVO Input History (Archives) </Text>
          <View style={styles.contentContainer}> 
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={navigateToSeminarFormarchive}>
                <Text style={styles.buttonText}>SEMINARS/TRAININGS/IEC Report Forms</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={navigateToField_vacc_archives}>
                <Text style={styles.buttonText}>Rabies Field Vaccination Form</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={navigateToAnimalControlarchive}>
                <Text style={styles.buttonText}>Animal Control and Rehabilitation Section Report Form</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={navigateToNeuter_Form_archive}>
                <Text style={styles.buttonText}>Neuter Form</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={navigateToSample_form_archive}>
                <Text style={styles.buttonText}>Rabies Sample Information</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={navigateToScheduleFormarchive}>
                <Text style={styles.buttonText}>Schedule/Event Form</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={navigateToBudgetFormarchive}>
                <Text style={styles.buttonText}>Budget Form</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={navigateToRabiesExposureFormarchive}>
                <Text style={styles.buttonText}>Rabies Exposure</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={styles.button} onPress={navigateToWeatherFormarchive}>
                <Text style={styles.buttonText}>Weather Archives</Text>
              </TouchableOpacity> */}
            </View>

              <TouchableOpacity style={styles.Menubutton} onPress={navigateToVetMenu}>
                <Text style={styles.buttonText}>Main Menu</Text>
              </TouchableOpacity>
            
          </View>
        </View>
      );
};

  export default VetArchiveMenu;