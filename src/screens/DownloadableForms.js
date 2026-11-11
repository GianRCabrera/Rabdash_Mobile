import React, { useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
import { useAuth } from '../context/AuthContext';
import { downloadsFor } from '../constants/catalog';
import { AppModal, ListRow, MenuScreen } from '../components';

// The Excel report templates, filtered by role (see constants/catalog.js).
// DownloadableFormsPrivVet re-exports this.
const DownloadableForms = () => {
  const { state } = useAuth();

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

  const handleDownload = (file) =>
    downloadFile(`${apiURL}/assets/templates/${file}`, file).catch(() => {});

  return (
    <MenuScreen title="Downloadable Forms" showBack>
      {downloadsFor(state.user.position).map((item) => (
        <ListRow
          key={item.key}
          icon="microsoft-excel"
          title={item.title}
          subtitle={item.file}
          showChevron={false}
          onPress={() => handleDownload(item.file)}
        />
      ))}

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
