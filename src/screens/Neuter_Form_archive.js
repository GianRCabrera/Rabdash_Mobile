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
  const [reviewerTotal, setReviewerTotal] = useState(0);
  const itemsPerPage = 5;
  const isFirstSearchRender = useRef(true);

  // PROVISIONAL (see CLAUDE.md): only RabDash is a full reviewer. The
  // reviewer's merged dataset can be large (see backend/app.js's
  // createPaginatedCvoListHandler), so it's paginated and searched
  // server-side. Private Veterinarian/CVO see only their own small,
  // per-user submission list, which stays a one-shot fetch with
  // client-side search/pagination.
  const isReviewer = user?.position === 'RabDash';

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  const fetchReviewerPage = useCallback(async (page, search) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiURL}/getNeuterFormsCVO`, {
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
        const response = await axios.get(`${apiURL}/Position`);
        setUser(response.data);

        if (response.data.position === 'RabDash') {
          await fetchReviewerPage(1, '');
        } else if (response.data.position === 'Private Veterinarian' || response.data.position === 'CVO') {
          const formsResponse = await axios.get(`${apiURL}/getNeuterForms`);
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

  // Reviewer only: debounced server-side search, replacing client-side
  // filtering for this path — see Field_vacc_archives.js for the same
  // pattern and why. Skips on mount since the initial fetch above already
  // covers the empty-search case.
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
      setFilteredForms(vaccinationForms);
      return;
    }
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
  }, [searchTerm, vaccinationForms, isReviewer]);

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
          if (isReviewer) {
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

  const addOneDayToDate = (dateStr) => {
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
  const pageItems = isReviewer ? filteredForms : filteredForms.slice(startIndex, endIndex);
  const hasNext = isReviewer ? currentPage * REVIEWER_PAGE_SIZE < reviewerTotal : filteredForms.length > endIndex;

  return (
    <ArchiveScreen
      title="Neuter Archive"
      loading={isLoading}
      isEmpty={pageItems.length === 0}
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
