import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { AppButton, AppModal, MenuScreen, menuStyles } from '../components';

const DownloadableForms = () => {
  const navigation = useNavigation();

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

      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const uri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

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

  const handleDownloadIEC = () => downloadFile(`${apiURL}/assets/templates/IEC_Report_form.xlsx`, 'IEC_Report_form.xlsx').catch(() => {});
  const handleDownloadSch = () => downloadFile(`${apiURL}/assets/templates/Schedule_Report_form.xlsx`, 'Schedule_Report_form.xlsx').catch(() => {});
  const handleDownloadRabVac = () => downloadFile(`${apiURL}/assets/templates/Vaccination_Report_form.xlsx`, 'Vaccination_Report_form.xlsx').catch(() => {});
  const handleDownloadDailyReportform = () => downloadFile(`${apiURL}/assets/templates/Daily_Report_form.xlsx`, 'Daily_Report_form.xlsx').catch(() => {});
  const handleDownloadNeuterForm = () => downloadFile(`${apiURL}/assets/templates/Neuter_Report_form.xlsx`, 'Neuter_Report_form.xlsx').catch(() => {});
  const handleDownloadRabSampleForm = () => downloadFile(`${apiURL}/assets/templates/Rabies_Sample_Report_form.xlsx`, 'Rabies_Sample_Report_form.xlsx').catch(() => {});
  const handleDownloadBudgetForm = () => downloadFile(`${apiURL}/assets/templates/Budget_Report_form.xlsx`, 'Budget_Report_form.xlsx').catch(() => {});
  const handleDownloadExpForm = () => downloadFile(`${apiURL}/assets/templates/Rabies_Exposure_Report_form.xlsx`, 'Rabies_Exposure_Report_form.xlsx').catch(() => {});

  const navigateToVetMenu = () => navigation.navigate('VetMenu');

  return (
    <MenuScreen title="Downloadable Forms">
      <View style={menuStyles.row}>
        <AppButton title="IEC Report Form" variant="inverse" onPress={handleDownloadIEC} style={menuStyles.rowButton} />
        <AppButton title="Rabies Vaccination Form" variant="inverse" onPress={handleDownloadRabVac} style={menuStyles.rowButton} />
      </View>
      <View style={menuStyles.row}>
        <AppButton title="Animal Control and Rehab. Form" variant="inverse" onPress={handleDownloadDailyReportform} style={menuStyles.rowButton} />
        <AppButton title="Neuter Form" variant="inverse" onPress={handleDownloadNeuterForm} style={menuStyles.rowButton} />
      </View>
      <View style={menuStyles.row}>
        <AppButton title="Rabies Sample Information Form" variant="inverse" onPress={handleDownloadRabSampleForm} style={menuStyles.rowButton} />
        <AppButton title="Schedule/Event Form" variant="inverse" onPress={handleDownloadSch} style={menuStyles.rowButton} />
      </View>
      <View style={menuStyles.row}>
        <AppButton title="Budget Form" variant="inverse" onPress={handleDownloadBudgetForm} style={menuStyles.rowButton} />
        <AppButton title="Exposure Form" variant="inverse" onPress={handleDownloadExpForm} style={menuStyles.rowButton} />
      </View>

      <AppButton
        title="Main Menu"
        variant="ghost"
        onPress={navigateToVetMenu}
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

export default DownloadableForms;
