import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator,  TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles/Archive';
import Modal from 'react-native-modal';
import axios from 'axios';

const WeatherFormArchive = () => {
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
    const fetchVaccinationForms = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${apiURL}/getWeatherForms`);
        setVaccinationForms(response.data);
        setFilteredForms(response.data); // Initialize filteredForms with all forms
      } catch (error) {
        console.error('Error fetching Weather Form Archives:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVaccinationForms();
  }, []);

  useEffect(() => {
    
    const filtered = vaccinationForms.filter(form => 
      form.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.minimum_temperature?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.maximum_temperature?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.mean_temperature?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.relative_humidity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.rainfall?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.precipitation?.toLowerCase().includes(searchTerm.toLowerCase())

      //String(form.age).toLowerCase().includes(searchTerm.toLowerCase()) || // Convert to string
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
    navigation.navigate('WeatherForm', {
      item: editableItem,
      fromArchive: true
    });
    toggleConfirmModal();
  }
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
        <Text style={styles.header}>Weather Form Archive </Text>
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
              <Text>Minimum Temperature: {item.minimum_temperature}</Text>
              <Text>Maximum Temperature: {item.maximum_temperature}</Text>
              <Text>Mean Temperature: {item.mean_temperature}</Text>
              <Text>Relative Humidity: {item.relative_humidity}</Text>
              <Text>Rainfall: {item.rainfall}</Text>
              <Text>Precipitation: {item.precipitation}</Text>

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

export default WeatherFormArchive;
