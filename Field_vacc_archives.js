import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, TextInput} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/Archive';
import Modal from 'react-native-modal';
import axios from 'axios';

const Field_vacc_archives = () => {

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

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  useEffect(() => {
    const fetchUserAndForms = async () => {
      setIsLoading(true); // Start loading
      try {
        const response = await axios.get(`${apiURL}/Position`);
        setUser(response.data);

        let formsResponse;
        if (response.data.position === 'CVO' || response.data.position === 'Rabdash') {
          formsResponse = await axios.get(`${apiURL}/getVaccinationFormsCVO`);
        } else if (response.data.position === 'Private Veterinarian') {
          formsResponse = await axios.get(`${apiURL}/getVaccinationForms`);
        } else {
          console.warn('Unknown user position:', response.data.position);
          setIsLoading(false); // Stop loading if position is unrecognized
          return;
        }
        setVaccinationForms(formsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchUserAndForms();
  }, []);

  useEffect(() => {
    const filtered = vaccinationForms.filter(form => 
      form.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.date.includes(searchTerm) ||
      form.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.purok.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.vaccinator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.timeStart.includes(searchTerm) ||
      form.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.sex.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.contactNo.toLowerCase().includes(searchTerm.toLowerCase()) ||

      form.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.petAge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.petSex.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.cardNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.vaccine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.dateVaccinated.includes(searchTerm) ||
      form.timeFinish.includes(searchTerm)
    );
  
    if (filtered.length > 0) {
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
      navigation.navigate('Rabies_Field_Vacc_Form', {
        item: editableItem, // Correctly pass the editableItem here
        fromArchive: true // Flag to indicate navigation came from archives
      });
      setEditableItem(null); // Reset editableItem after navigation
      toggleConfirmModal(); // Close the modal
    }
  };

  const handleBackPress = () => {
    const position = user?.position; // Use optional chaining

    if (position === 'CVO' || position === 'Rabdash') {
      navigation.navigate('VetArchiveMenu');
    } else if (position === 'Private Veterinarian') {
      navigation.navigate('ClientDatabase');
    } else {
      console.warn('Unknown user position:', position);
    }
  };

  const addOneDay = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1); // Add one day
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
        <Text style={styles.header}>Rabies Field Vaccination Archive</Text>
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
          data={filteredForms.slice(startIndex, endIndex)} // Render only the current page items
          //data={filteredForms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text>Email: {item.username}</Text>
              <Text>Date: {addOneDay(item.date.split('T')[0])}</Text>
              <Text>District: {item.district}</Text>
              <Text>Barangay: {item.barangay}</Text>
              <Text>Purok: {item.purok} </Text>
              <Text>Vaccinator/s: {item.vaccinator}</Text>
              <Text>Time Started: {item.timeStart}</Text>
              <Text>Owner Name: {item.ownerName}</Text>
              <Text>Address: {item.address}</Text>
              <Text>Sex: {item.sex}</Text>
              <Text>Contact No.: {item.contactNo}</Text>
              <Text>Animal Name: {item.petName}</Text>
              <Text>Animal Age: {item.petAge}</Text>
              <Text>Species: {item.species}</Text>
              <Text>Sex: {item.petSex}</Text>
              <Text>Color/Markings: {item.color}</Text>
              <Text>Card Number: {item.cardNo}</Text>
              <Text>Vaccine Used/Lot Number: {item.vaccine}</Text>
              <Text>Source of Vaccine: {item.source}</Text>
              <Text>Date Vaccinated: {addOneDay(item.dateVaccinated.split('T')[0])}</Text>
              <Text>Time Finished: {item.timeFinish}</Text>
              
              <TouchableOpacity style={styles.editButton} onPress={() => handleEditPress(item)}>
                <Text style={styles.modalButtonText}>Edit</Text>
              </TouchableOpacity>
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

        <TouchableOpacity style={styles.button} onPress={handleBackPress}>
            <Text style={styles.buttonText}>Archives Menu</Text>
        </TouchableOpacity>  

        {/* Modal to check if all fields are inputted */}
        <Modal isVisible={isConfirmModalVisible}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Do you want to proceed editing the Vaccination Form?</Text>
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

export default Field_vacc_archives;
