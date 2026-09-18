import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator,  TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/Archive';
import Modal from 'react-native-modal';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Rabies_Exposure_Form_Archive = () => {

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
        const response = await axios.get(`${apiURL}/getRabiesExposureForms`);
        setVaccinationForms(response.data);
        setFilteredForms(response.data); // Initialize filteredForms with all forms
      } catch (error) {
        console.error('Error fetching Human Rabies Exposure Form Archives:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVaccinationForms();
  }, []);

  useEffect(() => {
    
    const filtered = vaccinationForms.filter(form => 
      form.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.regDate?.includes(searchTerm) ||
      form.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(form.age).toLowerCase().includes(searchTerm.toLowerCase()) || // Convert to string
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
    if (filtered.length > 0 || searchTerm === '') {
      setFilteredForms(filtered);
    } else {
      console.log('No match found');
      setFilteredForms(vaccinationForms); // Show all items if no match or empty search
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
    navigation.navigate('Rabies_Exposure_Form1', {
      item: editableItem,
      fromArchive: true
    });
    toggleConfirmModal();
  }
};

// Function to format date and time
const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  // Subtract 4 hours from the time
  date.setHours(date.getHours() - 4);
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return date.toLocaleString('en-US', options);
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
  axios.delete(`${apiURL}/deleteRabiesExposureForm/${deletableItem.id}`)
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

const addOneDay = (dateStr) => {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0]; // Format back to YYYY-MM-DD
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
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
      <View style={styles.headerContainer}>
          <Text style={styles.header}>Rabies Exposure Form Archive Archive</Text>
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
          data={filteredForms.slice(startIndex, endIndex)} // Render only the current page items
          //data={filteredForms} 
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemText}>Username: <Text style={styles.itemDataText}>{item.username}</Text></Text>
              <Text style={styles.itemText}>Registration</Text>
              <Text style={styles.itemText}>No: <Text style={styles.itemDataText}>{item.regNo}</Text></Text>
              <Text style={styles.itemText}>Date: <Text style={styles.itemDataText}>{addOneDay(item.regDate.split('T')[0])}</Text></Text>
              <Text style={styles.itemText}>Name of Patient: <Text style={styles.itemDataText}>{item.name}</Text></Text>
              <Text style={styles.itemText}>Address: <Text style={styles.itemDataText}>{item.address}</Text></Text>

              <Text style={styles.itemText}>History of Exposure</Text>
              <Text style={styles.itemText}>Age: <Text style={styles.itemDataText}>{item.age}</Text></Text>
              <Text style={styles.itemText}>Sex: <Text style={styles.itemDataText}>{item.sex}</Text></Text>
              <Text style={styles.itemText}>Date: <Text style={styles.itemDataText}>{formatDateTime(item.expDate)}</Text></Text>
              <Text style={styles.itemText}>Place (Where biting occured): <Text style={styles.itemDataText}>{item.place}</Text></Text>
              <Text style={styles.itemText}>Type of Animal: <Text style={styles.itemDataText}>{item.typeAnimal}</Text></Text>
              <Text style={styles.itemText}>Type (B/NB):<Text style={styles.itemDataText}>{item.typeBNB}</Text></Text>
              <Text style={styles.itemText}>Site (body parts): <Text style={styles.itemDataText}>{item.site}</Text></Text>

              <Text style={styles.itemText}>Post Exposure Prophylaxis (PEP)</Text>
              <Text style={styles.itemText}>Category (1,2, and 3): <Text style={styles.itemDataText}>{item.category}</Text></Text>
              <Text style={styles.itemText}>Washing of Bite: <Text style={styles.itemDataText}>{item.washing}</Text></Text>
              <Text style={styles.itemText}>RIG Data Given: <Text style={styles.itemDataText}>{formatDateTime(item.RIG)}</Text></Text>

              <Text style={styles.itemText}>Tissue Culture Vaccine (Date Given)</Text>
              <Text style={styles.itemText}>Route: <Text style={styles.itemDataText}>{item.route}</Text></Text>
              <Text style={styles.itemText}>D0: <Text style={styles.itemDataText}>{formatDateTime(item.d0)}</Text></Text>
              <Text style={styles.itemText}>D3: <Text style={styles.itemDataText}>{formatDateTime(item.d3)}</Text></Text>
              <Text style={styles.itemText}>D7: <Text style={styles.itemDataText}>{formatDateTime(item.d7)}</Text></Text>
              <Text style={styles.itemText}>D14: <Text style={styles.itemDataText}>{formatDateTime(item.d14)}</Text></Text>
              <Text style={styles.itemText}>D28: <Text style={styles.itemDataText}>{formatDateTime(item.d28)}</Text></Text>
              <Text style={styles.itemText}>Brand Name: <Text style={styles.itemDataText}>{item.brand}</Text></Text>
              <Text style={styles.itemText}>Outcome (C/Inc/N/D): <Text style={styles.itemDataText}>{item.outcome}</Text></Text>
              <Text style={styles.itemText}>Biting Animal Status (after 14 days) (Alive/Dead/Lost): <Text style={styles.itemDataText}>{item.bitingStatus}</Text></Text>
              <Text style={styles.itemText}>Remarks: <Text style={styles.itemDataText}>{item.remarks}</Text></Text>

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

export default Rabies_Exposure_Form_Archive;
