import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
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
import { colors } from '../theme/theme';

const Field_vacc_archives = () => {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const itemsPerPage = 5;

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  useEffect(() => {
    const fetchUserAndForms = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${apiURL}/Position`, { withCredentials: true });
        setUser(response.data);

        // PROVISIONAL (see CLAUDE.md): only RabDash is a full reviewer for now —
        // CVO is scoped like Private Veterinarian (own submissions only), same
        // as the backend's getVaccinationForms/getVaccinationFormsCVO split.
        let formsResponse;
        if (response.data.position === 'RabDash') {
          formsResponse = await axios.get(`${apiURL}/getVaccinationFormsCVO`, {
            params: { page: 1, limit: itemsPerPage },
            withCredentials: true,
          });
        } else if (response.data.position === 'Private Veterinarian' || response.data.position === 'CVO') {
          formsResponse = await axios.get(`${apiURL}/getVaccinationForms`, {
            params: { page: 1, limit: itemsPerPage },
            withCredentials: true,
          });
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
    // Null-safe: any field can be null/missing on a given record, and this used to
    // call .toLowerCase() directly on each one, crashing the whole screen on load
    // (not just on search) the moment any record had a null field.
    const matches = (value) => String(value ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const filtered = vaccinationForms.filter(form =>
      matches(form.username) ||
      matches(form.date) ||
      matches(form.district) ||
      matches(form.barangay) ||
      matches(form.purok) ||
      matches(form.vaccinator) ||
      matches(form.timeStart) ||
      matches(form.ownerName) ||
      matches(form.address) ||
      matches(form.sex) ||
      matches(form.contactNo) ||
      matches(form.petName) ||
      matches(form.petAge) ||
      matches(form.species) ||
      matches(form.petSex) ||
      matches(form.color) ||
      matches(form.cardNo) ||
      matches(form.vaccine) ||
      matches(form.source) ||
      matches(form.dateVaccinated) ||
      matches(form.timeFinish)
    );

    // Previously fell back to showing the full unfiltered list when a search
    // had zero matches, instead of an empty state — searching for something
    // that genuinely doesn't exist silently looked like the search did nothing.
    setFilteredForms(filtered);
  }, [searchTerm, vaccinationForms]);

  const handleEditPress = (item) => {
    setEditableItem(item);
    toggleConfirmModal();
  };

  const submitForm = () => {
    if (editableItem) {
      navigation.navigate('Rabies_Field_Vacc_Form', {
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
    axios.delete(`${apiURL}/deleteVaccinationForm/${deletableItem.id}`, { withCredentials: true })
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
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleNextPage = async () => {
    const nextPage = currentPage + 1;
    setIsFetching(true);
    try {
      // Fixed: this previously always hit the CVO endpoint regardless of
      // position, so a Private Veterinarian or CVO user's "next page" would
      // fetch RabDash-scoped data instead of their own.
      const endpoint = user?.position === 'RabDash' ? 'getVaccinationFormsCVO' : 'getVaccinationForms';
      const response = await axios.get(`${apiURL}/${endpoint}`, {
        params: { page: nextPage, limit: itemsPerPage },
        withCredentials: true,
      });
      setVaccinationForms([...vaccinationForms, ...response.data]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error fetching next page:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = filteredForms.slice(startIndex, endIndex);

  return (
    <ArchiveScreen
      title="Rabies Field Vaccination Archive"
      loading={isLoading}
      isEmpty={filteredForms.length === 0}
      emptyMessage="No vaccination records found."
    >
      <ArchiveSearchBar
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search by owner, pet name, or date..."
      />

      {pageItems.map((item) => (
        <ArchiveListItem
          key={item.id}
          fields={[
            { label: 'Username', value: item.username },
            { label: 'Date', value: addOneDay(item.date.split('T')[0]) },
            { label: 'District', value: item.district },
            { label: 'Barangay', value: item.barangay },
            { label: 'Purok', value: item.purok },
            { label: 'Vaccinator/s', value: item.vaccinator },
            { label: 'Time Started', value: item.timeStart },
            { label: 'Owner Name', value: item.ownerName },
            { label: 'Address', value: item.address },
            { label: 'Sex', value: item.sex },
            { label: 'Contact No.', value: item.contactNo },
            { label: 'Animal Name', value: item.petName },
            { label: 'Animal Age', value: item.petAge },
            { label: 'Species', value: item.species },
            { label: 'Animal Sex', value: item.petSex },
            { label: 'Color/Markings', value: item.color },
            { label: 'Card Number', value: item.cardNo },
            { label: 'Vaccine Used/Lot Number', value: item.vaccine },
            { label: 'Source of Vaccine', value: item.source },
            { label: 'Date Vaccinated', value: addOneDay(item.dateVaccinated.split('T')[0]) },
            { label: 'Time Finished', value: item.timeFinish },
          ]}
          onEdit={() => handleEditPress(item)}
          onDelete={() => handleDeletePress(item)}
        />
      ))}

      {isFetching && <ActivityIndicator size="large" color={colors.onPrimary} />}

      <ArchivePagination
        page={currentPage}
        hasPrev={currentPage > 1}
        hasNext={vaccinationForms.length >= endIndex}
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
        message="Do you want to proceed editing the Vaccination Form?"
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

export default Field_vacc_archives;
