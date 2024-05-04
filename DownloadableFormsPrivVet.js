import React, { useState } from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/login';
import Modal from 'react-native-modal';
import { Asset } from 'expo-asset';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { Buffer } from 'buffer'; // Import the Buffer class

const DownloadableFormsPrivVet = () => {
  const navigation = useNavigation();

  const { StorageAccessFramework } = FileSystem;

  // State for managing modal visibility and message
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const apiURL = process.env.EXPO_PUBLIC_URL;

  const handleDownloadRabVac = async () => {
    try {
      const fileUrl = `${apiURL}/assets/templates/Vaccination_Report_form.xlsx`;
      await downloadFile(fileUrl, 'Vaccination_Report_form.xlsx');
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  
  const handleDownloadNeuterForm = async () => {
    try {
      const fileUrl = `${apiURL}/assets/templates/Neuter_Report_form.xlsx`;
      await downloadFile(fileUrl, 'Neuter_Report_form.xlsx');
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  
  const handleDownloadRabSampleForm = async () => {
    try {
      const fileUrl = `${apiURL}/assets/templates/Rabies_Sample_Report_form.xlsx`;
      await downloadFile(fileUrl, 'Rabies_Sample_Report_form.xlsx');
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const downloadFile = async (fileUrl, fileName) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access media library denied');
        return;
      }
  
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const uri = await StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
        const response = await fetch(fileUrl);
        console.log("Response Status Code:", response.status); // Log status code
  
        if (!response.ok) {
          throw new Error(`Failed to download file: Status Code ${response.status}`);
        }
  
        const fileData = await response.arrayBuffer();
        const base64Data = Buffer.from(new Uint8Array(fileData)).toString('base64');
        await FileSystem.writeAsStringAsync(uri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
        console.log('File downloaded successfully to:', uri);
        showModal(`${fileName} downloaded successfully`);
      } else {
        console.log('Permission to access storage denied');
      }
    } catch (error) {
      console.error(`Error downloading file ${fileName}:`, error);
      showModal(`Error downloading ${fileName}`);
      throw error;
    }
  };

  // Function to show the modal with a specific message
  const showModal = (message) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  // Function to hide the modal
  const hideModal = () => {
    setModalVisible(false);
  };

  const navigateToMainMenu = () => {
    navigation.navigate('MainMenu');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Downloadable Forms </Text>
      <TouchableOpacity style={styles.button} onPress={handleDownloadRabVac}>
        <Text style={styles.buttonText}>Rabies Vaccination Form Download</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleDownloadNeuterForm}>
        <Text style={styles.buttonText}>Neuter Form Download</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleDownloadRabSampleForm}>
        <Text style={styles.buttonText}>Rabies Sample Form Download</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={navigateToMainMenu}>
        <Text style={styles.buttonText}>Go back to Main Menu</Text>
      </TouchableOpacity>
      {/* Success Modal */}
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>{modalMessage}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={hideModal}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default DownloadableFormsPrivVet;
