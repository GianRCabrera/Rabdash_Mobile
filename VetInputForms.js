import React from 'react';
import { View,
  Text,
  TouchableOpacity,
  StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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
          <Text style={styles.header}>CVO and Rabdash Form Menu</Text>
          <TouchableOpacity style={styles.button} onPress={navigateToRabies_Field_Vacc_Form}>
            <Text style={styles.buttonText}>Rabies Field Vaccination Report Form</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToRabies_Neuter_Form}>
            <Text style={styles.buttonText}>Neuter Form</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToAnimalControlForm}>
            <Text style={styles.buttonText}>Animal Control & Rehab. Section Report Form </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToRabies_Sample_Information_Form}>
            <Text style={styles.buttonText}>Rabies Sample Information Form</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToBudgetForm}>
            <Text style={styles.buttonText}>Budget Form</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToWeatherForm}>
            <Text style={styles.buttonText}>Weather Form</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToScheduleForm}>
            <Text style={styles.buttonText}>Schedule/Event Form </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToIECForm}>
            <Text style={styles.buttonText}>SEMINARS/TRAININGS/IEC Report Form </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToRabies_Exposure_Form1}>
            <Text style={styles.buttonText}>Rabies Exposure Form </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToMainMenu}>
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
export default VetInputForms;
