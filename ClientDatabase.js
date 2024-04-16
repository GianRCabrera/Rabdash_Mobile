import React from 'react';
import { View,
  Text,
  TouchableOpacity,
  StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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
          <Text style={styles.header}>Client Input History (Forms) </Text>
          <TouchableOpacity style={styles.button} onPress={navigateToField_vacc_archives}>
            <Text style={styles.buttonText}>Rabies Field Vaccination Form Archives</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToNeuter_Form_archive}>
            <Text style={styles.buttonText}>Neuter Form Archives</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToSample_form_archive}>
            <Text style={styles.buttonText}>Rabies Sample Information Form</Text>
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
  
  export default ClientDatabase;