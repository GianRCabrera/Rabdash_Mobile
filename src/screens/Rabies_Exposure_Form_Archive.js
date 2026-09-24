import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import {
  AppModal,
  ArchiveScreen,
  ArchiveSearchBar,
  ArchiveListItem,
  ArchivePagination,
  AppButton,
  menuStyles,
} from '../components';

const Rabies_Exposure_Form_Archive = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vaccinationForms, setVaccinationForms] = useState([]);

  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [editableItem, setEditableItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredForms, setFilteredForms] = useState([]);

  const [deletableItem, setDeletableItem] = useState(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleBackPress = () => {
    const position = user?.position;
    if (position === 'CVO' || position === 'RabDash') {
      navigation.navigate('VetArchiveMenu');
    } else if (position === 'Private Veterinarian') {
      navigation.navigate('ClientDatabase');
    } else {
      console.warn('Unknown user position:', position);
    }
  };

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  useEffect(() => {
    // getRabiesExposureForms has no CVO-scoped counterpart on the backend,
    // so every position still sees the same unscoped data — only the
    // back-navigation destination is position-aware here.
    const fetchUserAndForms = async () => {
      setIsLoading(true);
      try {
        const [positionResponse, formsResponse] = await Promise.all([
          axios.get(`${apiURL}/Position`),
          axios.get(`${apiURL}/getRabiesExposureForms`),
        ]);
        setUser(positionResponse.data);
        setVaccinationForms(formsResponse.data);
      } catch (error) {
        console.error('Error fetching Human Rabies Exposure Form Archives:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndForms();
  }, []);

  useEffect(() => {
    const filtered = vaccinationForms.filter(form =>
      form.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.regDate?.includes(searchTerm) ||
      form.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(form.age).toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.sex?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.expDate?.includes(searchTerm) ||
      form.place?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.typeAnimal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.typeBNB?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.site?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.washing?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.RIG?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.route?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.d0?.includes(searchTerm) ||
      form.d3?.includes(searchTerm) ||
      form.d7?.includes(searchTerm) ||
      form.d14?.includes(searchTerm) ||
      form.d28?.includes(searchTerm) ||
      form.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.outcome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.bitingStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Previously fell back to the full unfiltered list on zero matches —
    // fixed to show an actual empty state instead.
    setFilteredForms(filtered);
  }, [searchTerm, vaccinationForms]);

  const handleEditPress = (item) => {
    setEditableItem(item);
    toggleConfirmModal();
  };

  const submitForm = () => {
    if (editableItem) {
      navigation.navigate('Rabies_Exposure_Form1', {
        item: editableItem,
        fromArchive: true
      });
      toggleConfirmModal();
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    date.setHours(date.getHours() - 4);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return date.toLocaleString('en-US', options);
  };

  const handleDeletePress = (item) => {
    setDeletableItem(item);
    toggleDeleteModal();
  };

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!isDeleteModalVisible);
  };

  const deleteItem = () => {
    if (!deletableItem) return;

    setIsLoading(true);
    axios.delete(`${apiURL}/deleteRabiesExposureForm/${deletableItem.id}`, { params: { dbOrigin: deletableItem.dbOrigin } })
      .then(response => {
        if (response.data.success) {
          setVaccinationForms(prevForms => prevForms.filter(form => form.id !== deletableItem.id));
          setNotificationMessage('Entry deleted successfully!');
        } else {
          setNotificationMessage('Failed to delete entry. ' + response.data.message);
        }
      })
      .catch(error => {
        console.error('Error deleting item:', error);
        setNotificationMessage('An error occurred while deleting the entry.');
      })
      .finally(() => {
        setIsLoading(false);
        toggleDeleteModal(false);
        toggleNotificationModal();
        setDeletableItem(null);
      });
  };

  const toggleNotificationModal = () => {
    setNotificationModalVisible(!isNotificationModalVisible);
  };

  const addOneDay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = filteredForms.slice(startIndex, endIndex);

  return (
    <ArchiveScreen
      title="Rabies Exposure Form Archive"
      loading={isLoading}
      isEmpty={filteredForms.length === 0}
      emptyMessage="No exposure records found."
    >
      <ArchiveSearchBar
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search by patient, address, or date..."
      />

      {pageItems.map((item) => (
        <ArchiveListItem
          key={`${item.dbOrigin}-${item.id}`}
          title={item.name || 'Unnamed Patient'}
          subtitle={`Reg #${item.regNo ?? 'N/A'} • ${addOneDay(item.regDate.split('T')[0])}`}
          dbOrigin={item.dbOrigin}
          sections={[
            {
              title: 'Registration',
              fields: [
                { label: 'Username', value: item.username },
                { label: 'No.', value: item.regNo },
                { label: 'Date', value: addOneDay(item.regDate.split('T')[0]) },
                { label: 'Name of Patient', value: item.name },
                { label: 'Address', value: item.address },
              ],
            },
            {
              title: 'History of Exposure',
              fields: [
                { label: 'Age', value: item.age },
                { label: 'Sex', value: item.sex },
                { label: 'Date', value: formatDateTime(item.expDate) },
                { label: 'Place (Where biting occurred)', value: item.place },
                { label: 'Type of Animal', value: item.typeAnimal },
                { label: 'Type (B/NB)', value: item.typeBNB },
                { label: 'Site (Body parts)', value: item.site },
              ],
            },
            {
              title: 'Post Exposure Prophylaxis (PEP)',
              fields: [
                { label: 'Category (1, 2, and 3)', value: item.category },
                { label: 'Washing of Bite', value: item.washing },
                { label: 'RIG Date Given', value: formatDateTime(item.RIG) },
              ],
            },
            {
              title: 'Tissue Culture Vaccine (Date Given)',
              fields: [
                { label: 'Route', value: item.route },
                { label: 'D0', value: formatDateTime(item.d0) },
                { label: 'D3', value: formatDateTime(item.d3) },
                { label: 'D7', value: formatDateTime(item.d7) },
                { label: 'D14', value: formatDateTime(item.d14) },
                { label: 'D28', value: formatDateTime(item.d28) },
                { label: 'Brand Name', value: item.brand },
                { label: 'Outcome (C/Inc/N/D)', value: item.outcome },
                { label: 'Biting Animal Status (after 14 days)', value: item.bitingStatus },
                { label: 'Remarks', value: item.remarks },
              ],
            },
          ]}
          onEdit={() => handleEditPress(item)}
          onDelete={() => handleDeletePress(item)}
        />
      ))}

      <ArchivePagination
        page={currentPage}
        hasPrev={currentPage > 1}
        hasNext={filteredForms.length > endIndex}
        onPrev={handlePreviousPage}
        onNext={handleNextPage}
      />

      <AppButton
        title="Archives Menu"
        variant="ghost"
        onPress={handleBackPress}
        style={menuStyles.backButton}
        textStyle={menuStyles.backButtonText}
      />

      <AppModal
        isVisible={isConfirmModalVisible}
        message="Do you want to proceed editing the Rabies Exposure Form?"
        onBackdropPress={toggleConfirmModal}
        actions={[
          { label: 'No', variant: 'secondary', onPress: toggleConfirmModal },
          { label: 'Yes', onPress: submitForm },
        ]}
      />

      <AppModal
        isVisible={isDeleteModalVisible}
        message="Are you sure you want to delete this entry?"
        onBackdropPress={toggleDeleteModal}
        actions={[
          { label: 'No', variant: 'secondary', onPress: toggleDeleteModal },
          { label: 'Yes', variant: 'danger', onPress: deleteItem },
        ]}
      />

      <AppModal
        isVisible={isNotificationModalVisible}
        message={notificationMessage}
        onBackdropPress={toggleNotificationModal}
        actions={[{ label: 'OK', onPress: toggleNotificationModal }]}
      />
    </ArchiveScreen>
  );
};

export default Rabies_Exposure_Form_Archive;
