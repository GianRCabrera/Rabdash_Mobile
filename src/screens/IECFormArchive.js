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

const IECFormArchive = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vaccinationForms, setVaccinationForms] = useState([]);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [editableItem, setEditableItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredForms, setFilteredForms] = useState([]);

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [deletableItem, setDeletableItem] = useState(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

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
    // Previously this screen never fetched /Position and hardcoded its back
    // button straight to VetArchiveMenu regardless of who was viewing it —
    // a Private Veterinarian ended up on the CVO-only menu. The getIECForms
    // endpoint itself has no CVO-scoped counterpart (unlike Field Vacc/
    // Neuter/Sample), so every position still sees the same unscoped data —
    // only the back-navigation destination is fixed here.
    const fetchUserAndForms = async () => {
      setIsLoading(true);
      try {
        const [positionResponse, formsResponse] = await Promise.all([
          axios.get(`${apiURL}/Position`),
          axios.get(`${apiURL}/getIECForms`),
        ]);
        setUser(positionResponse.data);
        setVaccinationForms(formsResponse.data);
      } catch (error) {
        console.error('Error fetching SEMINARS/TRAININGS/IEC Report Form Archives:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndForms();
  }, []);

  useEffect(() => {
    const filtered = vaccinationForms.filter(form =>
      form.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.date?.includes(searchTerm) ||
      form.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.barangay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.purok?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(form.participants).toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.brochure?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(form.materials).toLowerCase().includes(searchTerm.toLowerCase())
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
      navigation.navigate('IECForm', {
        item: editableItem,
        fromArchive: true
      });
      toggleConfirmModal();
    }
  };

  const addOneDayToDate = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
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
    axios.delete(`${apiURL}/deleteIECForm/${deletableItem.id}`)
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
        toggleDeleteModal();
        toggleNotificationModal();
        setDeletableItem(null);
      });
  };

  const toggleNotificationModal = () => {
    setNotificationModalVisible(!isNotificationModalVisible);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = filteredForms.slice(startIndex, endIndex);

  return (
    <ArchiveScreen
      title="Seminars/Trainings/IEC Archive"
      loading={isLoading}
      isEmpty={filteredForms.length === 0}
      emptyMessage="No IEC records found."
    >
      <ArchiveSearchBar
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search by title, district, or date..."
      />

      {pageItems.map((item) => (
        <ArchiveListItem
          key={item.id}
          fields={[
            { label: 'Username', value: item.username },
            { label: 'Date', value: addOneDayToDate(item.date.split('T')[0]) },
            { label: 'Title', value: item.title },
            { label: 'District', value: item.district },
            { label: 'Barangay', value: item.barangay },
            { label: 'Purok', value: item.purok },
            { label: 'No. of Participants', value: item.participants },
            { label: 'Brochure (Kind)', value: item.brochure },
            { label: 'No. of Materials', value: item.materials },
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
        message="Do you want to proceed editing the IEC Form?"
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

export default IECFormArchive;
