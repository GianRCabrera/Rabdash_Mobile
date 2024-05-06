import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator,  TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/Archive';
import Modal from 'react-native-modal';
import axios from 'axios';

const AnimalControlArchives = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [vaccinationForms, setVaccinationForms] = useState([]);

  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  const [editableItem, setEditableItem] = useState(null); // Initialize state for storing item to edit

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredForms, setFilteredForms] = useState([]);
  const flatListRef = useRef(); // Add this ref for the FlatList

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
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Animal Control and Rehabilitation Section Daily Report Form Archive </Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by owner, pet name, or date..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit} // Updated to use the new search submit handler
        />
        <View style={styles.divider} />
         {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
        <FlatList
          ref={flatListRef} // Assign the ref to FlatList
          data={filteredForms} 
          //data={vaccinationForms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View>
              <Text>Email: {item.username}</Text>
              <Text>Date: {addOneDayToDate(item.date1)}</Text>
              <Text>Cage Number: {item.cageNum}</Text>
              
              <Text>Impounded</Text>
              <Text>No. of Heads: {item.impHeads}</Text>
              <Text>Date: {addOneDayToDate(item.date2)}</Text>
              
              <Text>Claimed</Text>
              <Text>No. of Heads: {item.claimedHeads} </Text>
              <Text>Date: {addOneDayToDate(item.date3)}</Text>
              
              <Text>Euthanized</Text>
              <Text>No. of Heads: {item.euthHeads}</Text>
              <Text>Date: {addOneDayToDate(item.date4)}</Text>
              <Text>Chief of Operation/Team Leader: {item.chief}</Text>

              <TouchableOpacity style={styles.editButton} onPress={() => handleEditPress(item)}>
                <Text style={styles.modalButtonText}>Edit</Text>
              </TouchableOpacity>
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
      </View>
    </ScrollView>
  );
};

export default AnimalControlArchives;
