import React from 'react';
import { View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/inputforms';

const InputForms = () => {
    const navigation = useNavigation();

    const navigateToRabies_Field_Vacc_Form = () => {
        navigation.navigate('Rabies_Field_Vacc_Form');
      };

    const navigateToRabies_Neuter_Form = () => {
        navigation.navigate('Neuter_Form');
    };

    const navigateToRabies_Sample_Information_Form = () => {
        navigation.navigate('Rabies_Sample_Information_Form')
    }

    const navigateToMainMenu = () => {
      navigation.navigate('MainMenu')
  }

    return (
        <View style={styles.container}>
          <Image
            source={require('./assets/forms_pic.png')} // Ensure the path is correct
            style={styles.backgroundImage} // Custom styles for the image
          />
          <Text style={styles.header}>Form Menu</Text>
          <View style={styles.contentContainer}> 

            <TouchableOpacity style={styles.Privbutton} onPress={navigateToRabies_Field_Vacc_Form}>
              <Text style={styles.buttonText}>Rabies Field Vaccination Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Privbutton} onPress={navigateToRabies_Neuter_Form}>
              <Text style={styles.buttonText}>Neuter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Privbutton} onPress={navigateToRabies_Sample_Information_Form}>
              <Text style={styles.buttonText}>Rabies Sample Information</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.PrivMenubutton} onPress={navigateToMainMenu}>
              <Text style={styles.buttonText}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
};

export default InputForms;
