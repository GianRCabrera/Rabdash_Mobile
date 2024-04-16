import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import styles from './styles/login';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';


const DownloadableForms = () => {
  const navigation = useNavigation();

  // State for managing modal visibility and message
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const SERVER_URL = 'http://192.168.1.7:3000'; // Replace with your server's base URL

    const handleDownloadIEC = async () => {
      try {
        const fileUrl = `${SERVER_URL}/assets/templates/IEC_Report_form.xlsx`;
        await downloadFile(fileUrl, 'IEC_Report_form.xlsx');
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    };

    const handleDownloadSch = async () => {
      try {
        const fileUrl = `${SERVER_URL}/assets/templates/Schedule_Report_form.xlsx`;
        await downloadFile(fileUrl, 'Schedule_Report_form.xlsx');
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    };

    const handleDownloadRabVac = async () => {
      try {
        const fileUrl = `${SERVER_URL}/assets/templates/Vaccination_Report_form.xlsx`;
        await downloadFile(fileUrl, 'Vaccination_Report_form.xlsx');
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    };

    const handleDownloadDailyReportform = async () => {
      try {
        const fileUrl = `${SERVER_URL}/assets/templates/Daily_Report_form.xlsx`;
        await downloadFile(fileUrl, 'Daily_Report_form.xlsx');
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    };

    const handleDownloadNeuterForm = async () => {
      try {
        const fileUrl = `${SERVER_URL}/assets/templates/Neuter_Report_form.xlsx`;
        await downloadFile(fileUrl, 'Neuter_Report_form.xlsx');
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    };
      
    const handleDownloadRabSampleForm = async () => {
      try {
        const fileUrl = `${SERVER_URL}/assets/templates/Rabies_Sample_Report_form.xlsx`;
        await downloadFile(fileUrl, 'Rabies_Sample_Report_form.xlsx');
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    };

    const handleDownloadBudgetForm = async () => {
      try {
        const fileUrl = `${SERVER_URL}/assets/templates/Budget_Report_form.xlsx`;
        await downloadFile(fileUrl, 'Budget_Report_form.xlsx');
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    };

    const handleDownloadExpForm = async () => {
      try {
        const fileUrl = `${SERVER_URL}/assets/templates/Rabies_Exposure_Report_form.xlsx`;
        await downloadFile(fileUrl, 'Rabies_Exposure_Report_form.xlsx');
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
    
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
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

  const navigateToVetMenu = () => {
    navigation.navigate('VetMenu');
  };

    return (
      <View style={styles.container}>
        <Text style={styles.header}>CVO Downloadable Forms </Text>
        <TouchableOpacity style={styles.button} onPress={handleDownloadIEC}>
          <Text style={styles.buttonText}>Download IEC Report Form</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleDownloadRabVac}>
          <Text style={styles.buttonText}>Download Rabies Vaccination Form</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleDownloadDailyReportform}>
          <Text style={styles.buttonText}>Download Animal Control and Rehab. Form</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleDownloadNeuterForm}>
          <Text style={styles.buttonText}>Download Neuter Form</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleDownloadRabSampleForm}>
          <Text style={styles.buttonText}>Download Rabies Sample Information Form</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleDownloadSch}>
          <Text style={styles.buttonText}>Download Schedule/Event Form</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleDownloadBudgetForm}>
          <Text style={styles.buttonText}>Download Budget Form</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.button} onPress={navigateToWeatherFormarchive}>
          <Text style={styles.buttonText}>Weather Form</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.button} onPress={handleDownloadExpForm}>
          <Text style={styles.buttonText}>Rabies Exposure Form</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={navigateToVetMenu}>
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

  export default DownloadableForms;