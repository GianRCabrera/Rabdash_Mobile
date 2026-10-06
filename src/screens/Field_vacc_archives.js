import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const REVIEWER_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

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
  const [reviewerTotal, setReviewerTotal] = useState(0);
  const isFirstSearchRender = useRef(true);

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const itemsPerPage = 5;
  // PROVISIONAL (see CLAUDE.md): only RabDash is a full reviewer. The
  // reviewer's dataset (web + mobile vaccination_form merged) is huge —
  // 400k+ rows on the web side alone — so it's paginated and searched
  // server-side (see backend/app.js's createPaginatedCvoListHandler).
  // Private Veterinarian/CVO see only their own small, per-user submission
  // list, which stays a one-shot fetch with client-side search/pagination,
  // same as every other archive screen.
  const isReviewer = user?.position === 'RabDash';

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  const fetchReviewerPage = useCallback(async (page, search) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiURL}/getVaccinationFormsCVO`, {
        withCredentials: true,
        params: { page, limit: REVIEWER_PAGE_SIZE, search },
      });
      setVaccinationForms(response.data.data);
      setReviewerTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiURL]);

  useEffect(() => {
    const fetchUserAndForms = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${apiURL}/Position`, { withCredentials: true });
        setUser(response.data);

        if (response.data.position === 'RabDash') {
          await fetchReviewerPage(1, '');
        } else if (response.data.position === 'Private Veterinarian' || response.data.position === 'CVO') {
          const formsResponse = await axios.get(`${apiURL}/getVaccinationForms`, { withCredentials: true });
          setVaccinationForms(formsResponse.data);
          setIsLoading(false);
        } else {
          console.warn('Unknown user position:', response.data.position);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchUserAndForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reviewer only: debounced server-side search, replacing the old
  // client-side filter below for this path — the dataset is far too large
  // (400k+ rows) to ever hold in memory to filter locally, and filtering
  // only whatever page happened to be loaded would silently miss every
  // record not on it. Skips on mount since the initial fetch above already
  // covers the empty-search case. Resets to page 1, since a new search
  // invalidates whatever page you were on for the old one.
  useEffect(() => {
    if (!isReviewer) return;
    if (isFirstSearchRender.current) {
      isFirstSearchRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchReviewerPage(1, searchTerm);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm, isReviewer, fetchReviewerPage]);

  useEffect(() => {
    if (isReviewer) {
      // Already filtered server-side; show exactly what came back.
      setFilteredForms(vaccinationForms);
      return;
    }
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
  }, [searchTerm, vaccinationForms, isReviewer]);

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
    axios.delete(`${apiURL}/deleteVaccinationForm/${deletableItem.id}`, {
      withCredentials: true,
      params: { dbOrigin: deletableItem.dbOrigin },
    })
      .then(response => {
        if (response.data.success) {
          if (isReviewer) {
            // Refetch rather than splice locally — the deleted row's spot in
            // the current page needs to be backfilled from the server, not
            // just removed, since this is one page of a much larger dataset.
            fetchReviewerPage(currentPage, searchTerm);
          } else {
            setVaccinationForms(prevForms => prevForms.filter(form => form.id !== deletableItem.id));
          }
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

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    if (isReviewer) {
      fetchReviewerPage(nextPage, searchTerm);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage <= 1) return;
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    if (isReviewer) {
      fetchReviewerPage(prevPage, searchTerm);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // Reviewer: the server already returns exactly one page (REVIEWER_PAGE_SIZE
  // rows), so filteredForms IS the page — no further slicing.
  const pageItems = isReviewer ? filteredForms : filteredForms.slice(startIndex, endIndex);
  const hasNext = isReviewer ? currentPage * REVIEWER_PAGE_SIZE < reviewerTotal : vaccinationForms.length >= endIndex;

  return (
    <ArchiveScreen
      title="Rabies Field Vaccination Archive"
      loading={isLoading}
      isEmpty={pageItems.length === 0}
      emptyMessage="No vaccination records found."
    >
      <ArchiveSearchBar
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search by owner, pet name, or date..."
      />

      {pageItems.map((item) => (
        <ArchiveListItem
          key={`${item.dbOrigin}-${item.id}`}
          title={item.ownerName || 'Unnamed Owner'}
          subtitle={`${item.petName || 'Unnamed pet'} • ${addOneDay(item.date.split('T')[0])}`}
          dbOrigin={item.dbOrigin}
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

      <ArchivePagination
        page={currentPage}
        hasPrev={currentPage > 1}
        hasNext={hasNext}
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
