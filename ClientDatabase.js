import React from 'react';
import { View,
  Text,
  TouchableOpacity,
  Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/inputforms';

const ClientDatabase = () => {
    const navigation = useNavigation();

      const navigateToField_vacc_archives = () => {
        navigation.navigate('Field_vacc_archives');
      };
    
      const navigateToNeuter_Form_archive= () => {
        navigation.navigate('Neuter_Form_archive')
      }

      const navigateToSample_form_archive= () => {
        navigation.navigate('Sample_form_archive')
      }
    
      const navigateToMainMenu = () => {
        navigation.navigate('MainMenu')
      }

    return (
        <View style={styles.container}>
          <Image
            source={require('./assets/archives.png')} // Ensure the path is correct
            style={styles.DLbackgroundImage} // Custom styles for the image
          />
          <Text style={styles.header}>Client Input History (Forms) </Text>
          <View style={styles.contentContainer}> 
            <TouchableOpacity style={styles.Privbutton} onPress={navigateToField_vacc_archives}>
              <Text style={styles.buttonText}>Rabies Field Vaccination Form Archives</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Privbutton} onPress={navigateToNeuter_Form_archive}>
              <Text style={styles.buttonText}>Neuter Form Archives</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Privbutton} onPress={navigateToSample_form_archive}>
              <Text style={styles.buttonText}>Rabies Sample Information Form</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.PrivMenubutton} onPress={navigateToMainMenu}>
              <Text style={styles.buttonText}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
};

  export default ClientDatabase;