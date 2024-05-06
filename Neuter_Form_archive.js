import React, { useState, useEffect, useRef } from 'react';
import { View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/Archive';
import Modal from 'react-native-modal';
import axios from 'axios';

const Neuter_Form_archive = () => {

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

  //const NETWORK_URL1 = 'http://192.168.1.211:3000/Position';
  //const NETWORK_URL1 = 'http://192.168.1.7:3000/Position';

  //const NETWORK_URL2 = 'http://192.168.1.211:3000/getNeuterFormsCVO';
  //const NETWORK_URL2 = 'http://192.168.1.7:3000/getNeuterFormsCVO';

  //const NETWORK_URL4 = 'http://192.168.1.211:3000/getNeuterForms';
  //const NETWORK_URL4 = 'http://192.168.1.7:3000/getNeuterForms';

  useEffect(() => {
    const fetchUserAndForms = async () => {
      setIsLoading(true); // Start loading
      try {
        const response = await axios.get(`${apiURL}/Position`);
        setUser(response.data);

        let formsResponse;
        if (response.data.position === 'CVO' || response.data.position === 'Rabdash') {
          formsResponse = await axios.get(`${apiURL}/getNeuterFormsCVO`);
        } else if (response.data.position === 'Private Veterinarian') {
          formsResponse = await axios.get(`${apiURL}/getNeuterForms`);
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
    form.age?.toString().includes(searchTerm) || // Assuming petAge is a number, convert it to string
    form.pets?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.cat?.toLowerCase().includes(searchTerm.toLowerCase()) 
    )
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
      navigation.navigate('Neuter_Form', {
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
        <Text style={styles.header}>Neuter Archive </Text>
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
          data={filteredForms.slice(startIndex, endIndex)} // Render only the data within the current page range
          //data={filteredForms}  
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View>
              <Text>Email: {item.username}</Text>
              <Text>Date: {addOneDayToDate(item.date)}</Text>
              <Text>District: {item.district}</Text>
              <Text>Barangay: {item.barangay}</Text>
              <Text>Purok: {item.purok} </Text>
              <Text>Procedure: {item.proc}</Text>
              <Text>Client: {item.client}</Text>
              <Text>Address: {item.address}</Text>
              <Text>Contact No.: {item.contactNo}</Text>
              
              <Text>Patient's Name: {item.name}</Text>
              <Text>Species: {item.species}</Text>
              <Text>Sex: {item.sex}</Text>
              <Text>Breed: {item.breed}</Text>
              <Text>Age: {item.age}</Text>
              <Text>Number of Dog (household): {item.pets}</Text>
              <Text>Number of Cat (household): {item.cat}</Text>

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

  export default Neuter_Form_archive;