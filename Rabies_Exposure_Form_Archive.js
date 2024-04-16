import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator,  TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/Archive';
import Modal from 'react-native-modal';
import axios from 'axios';

const Rabies_Exposure_Form_Archive = () => {

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
        <Text style={styles.header}>Rabies Exposure Form Archive Archive </Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by owner, pet name, or date..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit} // Updated to use the new search submit handler
        />
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
              <Text>Registration</Text>
              <Text>No: {item.regNo}</Text>
              <Text>Date: {formatDateTime(item.regDate)}</Text>
              <Text>Name of Patient: {item.name}</Text>
              <Text>Address: {item.address}</Text>

              <Text>History of Exposure</Text>
              <Text>Age: {item.age}</Text>
              <Text>Sex: {item.sex}</Text>
              <Text>Date: {formatDateTime(item.expDate)}</Text>
              <Text>Place (Where biting occured): {item.place}</Text>
              <Text>Type of Animal: {item.typeAnimal}</Text>
              <Text>Type (B/NB): {item.typeBNB}</Text>
              <Text>Site (body parts): {item.site}</Text>

              <Text>Post Exposure Prophylaxis (PEP)</Text>
              <Text>Category (1,2, and 3): {item.category}</Text>
              <Text>Washing of Bite: {item.washing}</Text>
              <Text>RIG Data Given: {formatDateTime(item.RIG)}</Text>

              <Text>Tissue Culture Vaccine (Date Given)</Text>
              <Text>Route: {item.route}</Text>
              <Text>D0: {formatDateTime(item.d0)}</Text>
              <Text>D3: {formatDateTime(item.d3)}</Text>
              <Text>D7: {formatDateTime(item.d7)}</Text>
              <Text>D14: {formatDateTime(item.d14)}</Text>
              <Text>D28: {formatDateTime(item.d28)}</Text>
              <Text>Brand Name: {item.brand}</Text>
              <Text>Outcome (C/Inc/N/D): {item.outcome}</Text>
              <Text>Biting Animal Status (after 14 days) (Alive/Dead/Lost): {item.bitingStatus}</Text>
              <Text>Remarks: {item.remarks}</Text>

              <TouchableOpacity style={styles.editButton} onPress={() => handleEditPress(item)}>
                <Text style={styles.modalButtonText}>Edit</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
            </View>
          )}
        />
        )}
        <TouchableOpacity style={styles.button} onPress={navigateToVetArchiveMenu}>
          <Text style={styles.buttonText}>Go back to Archives Menu</Text>
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

export default Rabies_Exposure_Form_Archive;
