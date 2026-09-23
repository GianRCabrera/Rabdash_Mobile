import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { AppButton, AppModal, MenuScreen, menuStyles } from '../components';

const DownloadableFormsPrivVet = () => {
  const navigation = useNavigation();

  const { StorageAccessFramework } = FileSystem;

  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const apiURL = process.env.EXPO_PUBLIC_URL;

  const showModal = (message) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
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
        if (!response.ok) {
          throw new Error(`Failed to download file: Status Code ${response.status}`);
        }

        const fileData = await response.arrayBuffer();
        const base64Data = Buffer.from(new Uint8Array(fileData)).toString('base64');
        await FileSystem.writeAsStringAsync(uri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
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

  const handleDownloadRabVac = () => downloadFile(`${apiURL}/assets/templates/Vaccination_Report_form.xlsx`, 'Vaccination_Report_form.xlsx').catch(() => {});
  const handleDownloadNeuterForm = () => downloadFile(`${apiURL}/assets/templates/Neuter_Report_form.xlsx`, 'Neuter_Report_form.xlsx').catch(() => {});
  const handleDownloadRabSampleForm = () => downloadFile(`${apiURL}/assets/templates/Rabies_Sample_Report_form.xlsx`, 'Rabies_Sample_Report_form.xlsx').catch(() => {});

  const navigateToMainMenu = () => navigation.navigate('MainMenu');

  return (
    <MenuScreen title="Downloadable Forms">
      <AppButton title="Rabies Vaccination Form Download" variant="inverse" onPress={handleDownloadRabVac} style={menuStyles.button} />
      <AppButton title="Neuter Form Download" variant="inverse" onPress={handleDownloadNeuterForm} style={menuStyles.button} />
      <AppButton title="Rabies Sample Form Download" variant="inverse" onPress={handleDownloadRabSampleForm} style={menuStyles.button} />

      <AppButton
        title="Main Menu"
        variant="ghost"
        onPress={navigateToMainMenu}
        style={menuStyles.backButton}
        textStyle={menuStyles.backButtonText}
      />

      <AppModal
        isVisible={isModalVisible}
        message={modalMessage}
        onBackdropPress={hideModal}
        actions={[{ label: 'OK', onPress: hideModal }]}
      />
    </MenuScreen>
  );
};

export default DownloadableFormsPrivVet;
