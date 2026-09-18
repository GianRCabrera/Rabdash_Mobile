import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator,  TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/Archive';
import Modal from 'react-native-modal';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AnimalControlArchives = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [vaccinationForms, setVaccinationForms] = useState([]);

  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  const [editableItem, setEditableItem] = useState(null); // Initialize state for storing item to edit

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredForms, setFilteredForms] = useState([]);
  const flatListRef = useRef(); // Add this ref for the FlatList

  const [deletableItem, setDeletableItem] = useState(null); // State to store item to be deleted
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false); // State to manage delete modal visibility

  const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const navigation = useNavigation();

  const apiURL = process.env.EXPO_PUBLIC_URL;

  const [currentPage, setCurrentPage] = useState(1); // State to manage current page
  const itemsPerPage = 5; // Number of items per page

  const navigateToVetArchiveMenu = () => {
    navigation.navigate('VetArchiveMenu');
  };

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  useEffect(() => {
    const fetchVaccinationForms = async() => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${apiURL}/getAnimalControlForms`);
        setVaccinationForms(response.data);
        setFilteredForms(response.data); // Initialize filteredForms with all forms
      } catch (error) {
        console.error('Error fetching Animal Control and Rehabilitation Section Daily Report Archive forms:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVaccinationForms();
  }, []);

  useEffect(() => {
    const filtered = vaccinationForms.filter(form => 
      form.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.date1?.includes(searchTerm) ||
      (form.cageNum?.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (form.impHeads?.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      form.date2?.includes(searchTerm) ||
      (form.claimedHeads?.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      form.date3?.includes(searchTerm) ||
      (form.euthHeads?.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      form.date4?.includes(searchTerm) ||
      form.chief?.toLowerCase().includes(searchTerm.toLowerCase()) 
    );
  
    if (filtered.length > 0) {
      setFilteredForms(filtered);
    } else {
      console.log('No match found');
      // Show all items if no match or empty search
      setFilteredForms(vaccinationForms);
    }
  }, [searchTerm, vaccinationForms]);

   // Function to find the first matched item index and scroll to it
 const handleSearchSubmit = () => {
  if (filteredForms.length > 0) {
    // If there are filtered forms, attempt to scroll to the top of the list
    flatListRef.current?.scrollToIndex({ animated: true, index: 0 });
  } else {
    console.log('No filtered items to scroll to');
  }
 };

 // Function to open modal and set the item to be edited
 const handleEditPress = (item) => {
  setEditableItem(item); // Store the item to be edited
  toggleConfirmModal();
};

const submitForm = () => {
  if (editableItem) {
    navigation.navigate('AnimalControlForm', {
      item: editableItem,
      fromArchive: true
    });
    toggleConfirmModal();
  }
};

// Function to handle deletion of item
const handleDeletePress = (item) => {
  setDeletableItem(item); // Store the item to be deleted
  toggleDeleteModal(); // Open the delete confirmation modal
};

// Function to toggle delete confirmation modal visibility
const toggleDeleteModal = () => {
  setDeleteModalVisible(!isDeleteModalVisible);
};

const deleteItem = () => {
  if (!deletableItem) return; // Ensure there is an item to delete

  setIsLoading(true); // Start loading indicator
  axios.delete(`${apiURL}/deleteAnimalControlForm/${deletableItem.id}`)
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
      setIsLoading(false); // Stop loading indicator
      toggleDeleteModal(false); // Close the delete confirmation modal
      toggleNotificationModal(); // Show notification modal
      setDeletableItem(null); // Clear the deletable item state
    });
};

const toggleNotificationModal = () => {
  setNotificationModalVisible(!isNotificationModalVisible);
};


// Function to add one day to the date
const addOneDayToDate = (dateStr) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0]; // Return the date in YYYY-MM-DD format
};

// Function to handle next page button press
const handleNextPage = () => {
  setCurrentPage(currentPage + 1);
};

// Calculate the slice range based on currentPage and itemsPerPage
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;

// Function to handle previous page button press
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
    <ScrollView contentContainerSFtyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Animal Control and Rehabilitation Section Daily Report Form Archive </Text>
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
          ref={flatListRef} // Assign the ref to FlatList
          data={filteredForms.slice(startIndex, endIndex)}
          //data={filteredForms} 
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemText}>Username: <Text style={styles.itemDataText}>{item.username}</Text></Text>
              <Text style={styles.itemText}>Date: <Text style={styles.itemDataText}>{addOneDayToDate(item.date1.split('T')[0])}</Text></Text>
              <Text style={styles.itemText}>Cage Number: <Text style={styles.itemDataText}>{item.cageNum}</Text></Text>
              
              <Text style={styles.itemText}>Impounded</Text>
              <Text style={styles.itemText}>No. of Heads: <Text style={styles.itemDataText}>{item.impHeads}</Text></Text>
              <Text style={styles.itemText}>Date: <Text style={styles.itemDataText}>{addOneDayToDate(item.date2.split('T')[0])}</Text></Text>
              
              <Text style={styles.itemText}>Claimed</Text>
              <Text style={styles.itemText}>No. of Heads: <Text style={styles.itemDataText}>{item.claimedHeads}</Text></Text>
              <Text style={styles.itemText}>Date: <Text style={styles.itemDataText}>{addOneDayToDate(item.date3.split('T')[0])}</Text></Text>
              
              <Text style={styles.itemText}>Euthanized</Text>
              <Text style={styles.itemText}>No. of Heads: <Text style={styles.itemDataText}>{item.euthHeads}</Text></Text>
              <Text style={styles.itemText}>Date: <Text style={styles.itemDataText}>{addOneDayToDate(item.date4.split('T')[0])}</Text></Text>
              <Text style={styles.itemText}>Chief of Operation/Team Leader: <Text style={styles.itemDataText}>{item.chief}</Text></Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditPress(item)}>
                  <Text style={styles.modalButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePress(item)}>
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.divider} />
            </View>
          )}
        />
        )}

        <Text Text style={styles.pageText}>Page: <Text>{currentPage}</Text></Text> 
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

        <TouchableOpacity style={styles.button} onPress={navigateToVetArchiveMenu}>
          <Text style={styles.buttonText}>Archives Menu</Text>
        </TouchableOpacity>

        {/* Modal to check if all fields are inputted */}
        <Modal isVisible={isConfirmModalVisible}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Do you want to proceed editing the Neuter Form?</Text>
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

export default AnimalControlArchives;
