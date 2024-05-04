import React from 'react';
import { View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/inputforms';

const VetInputForms = () => {
    const navigation = useNavigation();

    const navigateToRabies_Field_Vacc_Form = () => {
        navigation.navigate('Rabies_Field_Vacc_Form');
      };

    const navigateToRabies_Neuter_Form = () => {
        navigation.navigate('Neuter_Form');
    };

    const navigateToAnimalControlForm = () => {
      navigation.navigate('AnimalControlForm');
  };

    const navigateToRabies_Sample_Information_Form = () => {
        navigation.navigate('Rabies_Sample_Information_Form')
    }

    const navigateToBudgetForm = () => {
        navigation.navigate('BudgetForm')
    }

    const navigateToWeatherForm = () => {
      navigation.navigate('WeatherForm')
  }

  const navigateToScheduleForm = () => {
    navigation.navigate('ScheduleForm')
  }

  const navigateToIECForm = () => {
    navigation.navigate('IECForm')
  }

  const navigateToRabies_Exposure_Form1 = () => {
    navigation.navigate('Rabies_Exposure_Form1')
  }

    const navigateToMainMenu = () => {
      navigation.navigate('VetMenu')
  }

    return (
        <View style={styles.container}>
          <Image
            source={require('./assets/forms_pic.png')} // Ensure the path is correct
            style={styles.backgroundImage} // Custom styles for the image
          />
          <Text style={styles.header}>Forms</Text>
          <View style={styles.contentContainer}> 
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={navigateToRabies_Field_Vacc_Form}>
                <Text style={styles.buttonText}>Rabies Field Vaccination </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={navigateToRabies_Neuter_Form}>
                <Text style={styles.buttonText}>Neuter</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={navigateToAnimalControlForm}>
                <Text style={styles.buttonText}>Animal Control Section Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={navigateToRabies_Sample_Information_Form}>
                <Text style={styles.buttonText}>Rabies Sample Information</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={navigateToBudgetForm}>
                <Text style={styles.buttonText}>Budget</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={navigateToScheduleForm}>
                <Text style={styles.buttonText}>Schedule/Event</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={navigateToIECForm}>
                <Text style={styles.buttonText}>Seminar/Trainings/IEC</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={navigateToRabies_Exposure_Form1}>
                <Text style={styles.buttonText}>Rabies Exposure</Text>
              </TouchableOpacity>
            </View>

              <TouchableOpacity style={styles.Menubutton} onPress={navigateToMainMenu}>
                <Text style={styles.MenubuttonText}>Main Menu</Text>
              </TouchableOpacity>
          </View>
        </View>
      );
};

export default VetInputForms;
