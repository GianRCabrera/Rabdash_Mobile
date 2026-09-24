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

const Neuter_Form_archive = () => {
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

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  useEffect(() => {
    const fetchUserAndForms = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${apiURL}/Position`);
        setUser(response.data);

        // PROVISIONAL (see CLAUDE.md): only RabDash is a full reviewer for now —
        // CVO is scoped like Private Veterinarian (own submissions only).
        let formsResponse;
        if (response.data.position === 'RabDash') {
          formsResponse = await axios.get(`${apiURL}/getNeuterFormsCVO`);
        } else if (response.data.position === 'Private Veterinarian' || response.data.position === 'CVO') {
          formsResponse = await axios.get(`${apiURL}/getNeuterForms`);
        } else {
          console.warn('Unknown user position:', response.data.position);
          setIsLoading(false);
          return;
        }
        setVaccinationForms(formsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndForms();
  }, []);

  useEffect(() => {
    const filtered = vaccinationForms.filter(form =>
      (form.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.date?.includes(searchTerm) ||
      form.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.barangay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.purok?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.proc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.contactNo?.includes(searchTerm) ||
      form.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.sex?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.age?.toString().includes(searchTerm) ||
      form.pets?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.cat?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
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
      navigation.navigate('Neuter_Form', {
        item: editableItem,
        fromArchive: true
      });
      setEditableItem(null);
      toggleConfirmModal();
    }
  };

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
    axios.delete(`${apiURL}/deleteNeuterForm/${deletableItem.id}`, { params: { dbOrigin: deletableItem.dbOrigin } })
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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = filteredForms.slice(startIndex, endIndex);

  return (
    <ArchiveScreen
      title="Neuter Archive"
      loading={isLoading}
      isEmpty={filteredForms.length === 0}
      emptyMessage="No neuter records found."
    >
      <ArchiveSearchBar
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search by owner, pet name, or date..."
      />

      {pageItems.map((item) => (
        <ArchiveListItem
          key={`${item.dbOrigin}-${item.id}`}
          title={item.client || 'Unnamed Client'}
          subtitle={`${item.name || 'Unnamed patient'} • ${addOneDayToDate(item.date.split('T')[0])}`}
          dbOrigin={item.dbOrigin}
          fields={[
            { label: 'Username', value: item.username },
            { label: 'Date', value: addOneDayToDate(item.date.split('T')[0]) },
            { label: 'District', value: item.district },
            { label: 'Barangay', value: item.barangay },
            { label: 'Purok', value: item.purok },
            { label: 'Procedure', value: item.proc },
            { label: 'Client', value: item.client },
            { label: 'Address', value: item.address },
            { label: 'Contact No.', value: item.contactNo },
            { label: "Patient's Name", value: item.name },
            { label: 'Species', value: item.species },
            { label: 'Sex', value: item.sex },
            { label: 'Breed', value: item.breed },
            { label: 'Age', value: item.age },
            { label: 'Number of Dog (household)', value: item.pets },
            { label: 'Number of Cat (household)', value: item.cat },
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
        message="Do you want to proceed editing the Neuter Form?"
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

export default Neuter_Form_archive;
