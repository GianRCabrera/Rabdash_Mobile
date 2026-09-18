import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/Archive';
import Modal from 'react-native-modal';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Sample_form_archive = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vaccinationForms, setVaccinationForms] = useState([]);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [editableItem, setEditableItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredForms, setFilteredForms] = useState([]);
  const flatListRef = useRef();
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

        let formsResponse;
        if (response.data.position === 'CVO' || response.data.position === 'RabDash') {
          formsResponse = await axios.get(`${apiURL}/getRabiesSampleFormsCVO`);
        } else if (response.data.position === 'Private Veterinarian') {
          formsResponse = await axios.get(`${apiURL}/getRabiesSampleForms`);
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
    form.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.sex?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.barangay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.date?.includes(searchTerm) ||
    form.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.age?.toString().includes(searchTerm) || 
    form.sampleSex?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.specimen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.ownership?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.vacStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.manage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.death?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.changes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.otherillness?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.fatcount?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
    if (filtered.length > 0) {
      setFilteredForms(filtered);
    } else {
      console.log('No match found');
      setFilteredForms(vaccinationForms);
    }
  }, [searchTerm, vaccinationForms]);

  const handleSearchSubmit = () => {
    if (filteredForms.length > 0) {
      flatListRef.current?.scrollToIndex({ animated: true, index: 0 });
    } else {
      console.log('No filtered items to scroll to');
    }
  };

  const handleEditPress = (item) => {
    setEditableItem(item);
    toggleConfirmModal();
  };

  const submitForm = () => {
    if (editableItem) {
      navigation.navigate('Rabies_Sample_Information_Form', {
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
    axios.delete(`${apiURL}/deleteRabiesSampleForm/${deletableItem.id}`)
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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Rabies Sample Form Archive</Text>
        </View>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#000" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search by owner, pet name, or date..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
          />
        </View>
        <View style={styles.divider} />
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
        <FlatList
          ref={flatListRef}
          data={filteredForms.slice(startIndex, endIndex)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemText}>Email: <Text style={styles.itemDataText}>{item.username}</Text></Text>
              <Text style={styles.itemText}>Name: <Text style={styles.itemDataText}>{item.name}</Text></Text>
              <Text style={styles.itemText}>Sex: <Text style={styles.itemDataText}>{item.sex}</Text></Text>
              <Text style={styles.itemText}>Address: <Text style={styles.itemDataText}>{item.address}</Text></Text>
              <Text style={styles.itemText}>Contact No.: <Text style={styles.itemDataText}>{item.number}</Text></Text>
              <Text style={styles.itemText}>District: <Text style={styles.itemDataText}>{item.district}</Text></Text>
              <Text style={styles.itemText}>Barangay: <Text style={styles.itemDataText}>{item.barangay}</Text></Text>
              <Text style={styles.itemText}>Date: <Text style={styles.itemDataText}>{addOneDayToDate(item.date.split('T')[0])}</Text></Text>
              <Text style={styles.itemText}>Species: <Text style={styles.itemDataText}>{item.species}</Text></Text>
              <Text style={styles.itemText}>Breed: <Text style={styles.itemDataText}>{item.breed}</Text></Text>
              <Text style={styles.itemText}>Age: <Text style={styles.itemDataText}>{item.age}</Text></Text>

              <Text style={styles.itemText}>Sex: <Text style={styles.itemDataText}>{item.sampleSex}</Text></Text>
              <Text style={styles.itemText}>Specimen: <Text style={styles.itemDataText}>{item.specimen}</Text></Text>
              <Text style={styles.itemText}>Type of Ownership: <Text style={styles.itemDataText}>{item.ownership}</Text></Text>
              <Text style={styles.itemText}>Dog Vaccinated? <Text style={styles.itemDataText}>{item.vacStatus}</Text></Text>
              <Text style={styles.itemText}>Possible contact with other animals? <Text style={styles.itemDataText}>{item.contact}</Text></Text>
              <Text style={styles.itemText}>Pet Management: <Text style={styles.itemDataText}>{item.manage}</Text></Text>
              <Text style={styles.itemText}>Cause of Death: <Text style={styles.itemDataText}>{item.death}</Text></Text>
              <Text style={styles.itemText}>Behavioral Changes: <Text style={styles.itemDataText}>{item.changes}</Text></Text>
              <Text style={styles.itemText}>Other Signs of Illness: <Text style={styles.itemDataText}>{item.otherillness}</Text></Text>
              <Text style={styles.itemText}>FAT Result: <Text style={styles.itemDataText}>{item.fatcount}</Text></Text>

              <View style={styles.divider} />
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditPress(item)}>
                  <Text style={styles.modalButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePress(item)}>
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
        )}
        <Text style={styles.pageText}>Page: <Text>{currentPage}</Text></Text> 
        <View style={styles.buttonContainer}>
          {currentPage > 1 && (
            <TouchableOpacity style={styles.button} onPress={handlePreviousPage}>
              <Text style={styles.buttonText}>Previous Page</Text>
            </TouchableOpacity>
          )}

          {filteredForms.length > endIndex && (
            <TouchableOpacity style={styles.button} onPress={handleNextPage}>
              <Text style={styles.buttonText}>Next Page</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleBackPress}>
          <Text style={styles.buttonText}>Archives Menu</Text>
        </TouchableOpacity>

        <Modal isVisible={isConfirmModalVisible}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Do you want to proceed editing the Rabies Sample Form?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={() => submitForm(editableItem)}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={toggleConfirmModal}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal isVisible={isDeleteModalVisible}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Are you sure you want to delete this entry?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={deleteItem}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={toggleDeleteModal}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal isVisible={isNotificationModalVisible}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{notificationMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={toggleNotificationModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default Sample_form_archive;
