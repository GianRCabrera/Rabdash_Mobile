import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,  
  KeyboardAvoidingView,  // Add this import
  Platform,  // Add this import
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker'; // Add this import
import axios from 'axios';
import styles from './styles/submitform';

const Neuter_Form2 = () => {

  const [user, setUser] = useState(null);
  const route = useRoute();

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  
  const [age, setAge] = useState('');
  const [pets, setPets] = useState('');
  const [cat, setCat] = useState('');

  const [isSpeciesOpen, setIsSpeciesOpen] = useState(false);
  const [speciesValue, setSpeciesValue] = useState(null);

  const [isSexOpen, setIsSexOpen] = useState(false);
  const [sexValue, setSexValue] = useState(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isUpdateSuccessModalVisible, setUpdateSuccessModalVisible] = useState(false);

  const isEdit = route.params?.formData?.id ? true : false;

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleSpeciesOpen = () => {
    setIsSpeciesOpen(!isSpeciesOpen);
    setIsSexOpen(false);
  };

  const handleSexOpen = () => {
        setIsSexOpen(!isSexOpen);
        setIsSpeciesOpen(false);
  };

  const handleSpeciesChange = (value) => {
    setSpeciesValue(value);
  };

  const handleSexChange = (value) => {
    setSexValue(value);
  };

  const handleNameChange = (text) => {
    setName(text);
  };
  const handleBreedChange = (text) => {
    setBreed(text);
  };
  const handleAgeChange = (text) => {
    setAge(text);
  };
  const handlePetsChange = (text) => {
    setPets(text);
  };
  const handleCatChange = (text) => {
    setCat(text);
  };

  useEffect(() => {
    //const NETWORK_URL1 = 'http://192.168.1.211:3000/Position';
    //const NETWORK_URL1 = 'http://192.168.1.7:3000/Position';
   
      // Fetch user profile data from the backend
    axios.get(`${apiURL}/Position`)
    .then(response => {
      setUser(response.data);
    })
    .catch(error => {
      console.error('Error fetching position:', error);
      // Handle error, e.g., navigate to login screen
    });

    // Check if route.params exists before accessing its properties
    if (route.params) {
      const {
        date,
        district,
        barangay,
        purok,
        proc,
        client,
        address,
        contactNo,
      } = route.params;

      // Print the data in the console
      console.log('Date:', date);
      console.log('District:', district);
      console.log('Barangay:', barangay);
      console.log('Purok:', purok);
      console.log('Procedure:', proc);
      console.log('Client Name:', client);
      console.log('Address:', address);
      console.log('Contact Number:', contactNo);
      console.log('Next Entry');

    }

   //Editing Version path
   // Ensure formData exists and then access its properties
    // Extract data from the first form if editing
    if (route.params?.formData) {
      // Assuming formData contains all the necessary fields from the first form
      const {
        id,
        date,
        district,
        barangay,
        purok,
        proc,
        client,
        address,
        contactNo,
      } = route.params.formData;

      console.log('ID:', id);
      console.log('Date:', date);
      console.log('District:', district);
      console.log('Barangay:', barangay);
      console.log('Purok:', purok);
      console.log('Procedure:', proc);
      console.log('Client Name:', client);
      console.log('Address:', address);
      console.log('Contact Number:', contactNo);
    }
    // Ensure autofill functionality
    const { petData } = route.params || {};

    if (petData) {
    setName(petData.name || '');
    setSpeciesValue(petData.species || null);
    setSexValue(petData.sex || null);
    setBreed(petData.breed || '');
    setAge(petData.age || '');
    // Convert integer to string for TextInput
    setPets(petData.pets !== undefined ? petData.pets.toString() : '');
    setCat(petData.cat !== undefined ? petData.cat.toString() : '');
  }
  }, [route.params]);

  const handleSubmitPress = () => {
    // Check if all fields are filled
   if (
    name === '' ||
    speciesValue === null ||
    sexValue === null ||
    breed === '' ||
    age === '' ||
    pets === '' ||
    cat === ''
   ) {
     toggleModal();
   } 
   if (!name || !speciesValue || !sexValue || !breed || !age || !pets || !cat) {
    setModalVisible(true);
  } else {
    setConfirmModalVisible(true);
  }
 };

 const submitForm = () => {

  // Extract initial data passed to Neuter_Form2
  const formData = route.params?.formData || {};
  const isEdit = Boolean(formData?.id);

  // Ensure formData fields are correctly populated
  console.log("Form data for submission:", formData);
  
  // Prepare submission data for both new entries and edits
  let submissionData = {};

  if (isEdit) {
    // For edits, merge formData from the previous screen with updates from the current form
    const formData = route.params?.formData;
    submissionData = {
      id: formData.id, // Make sure 'id' is included in the submission data for edits
      date: formData.date,
      district: formData.district,
      barangay: formData.barangay,
      purok: formData.purok,
      proc: formData.proc,
      client: formData.client,
      address: formData.address,
      contactNo: formData.contactNo,

      name,
      species: speciesValue,
      sex: sexValue,
      breed,
      age,
      pets: pets.toString(),
      cat: cat.toString(),
    };
  } else {
    // For new entries, use both the data from the previous screen and the current form
    submissionData = {
      date: route.params?.date,
      district: route.params?.district,
      barangay: route.params?.barangay,
      purok: route.params?.purok,
      proc: route.params?.proc,
      client: route.params?.client,
      address: route.params?.address,
      contactNo: route.params?.contactNo,

      name,
      species: speciesValue,
      sex: sexValue,
      breed,
      age,
      pets: pets.toString(),
      cat: cat.toString(),
    };
  }

  const endpoint = isEdit ? `${apiURL}/editNeuterForm` : `${apiURL}/submitNeuterForm`;

  if (isEdit) {
    // If editing, include the ID in the formData
    formData.id = route.params.formData.id;
  }

 // Perform the POST request to the server
 axios.post(endpoint, submissionData)
 .then(response => {
  if (response.data.success) {
    console.log(isEdit ? "Neuter Form updated successfully." : "Neuter Form submitted successfully.");
    if (isEdit) {
      setUpdateSuccessModalVisible(true); // Show update success modal for edits
    } else {
      setSuccessModalVisible(true); // Show success modal for new entries
    }
  }
})
 .catch(error => {
   console.error('Error submitting Neuter form:', error);
 });
};

// Function to handle navigation after form submission
const navigateAfterSubmit = () => {
  const position = user.position;
  if (isEdit) {
    // If it's an edit, navigate to Neuter_Form_archive for both positions
    navigation.navigate('Neuter_Form_archive');
  } else {
    // If it's a new entry, navigate based on the user's position
    if (position === 'CVO' || position === 'Rabdash') {
      navigation.navigate('VetInputForms');
    } else if (position === 'Private Veterinarian') {
      navigation.navigate('InputForms');
    } else {
      console.warn('Unknown user position:', position);
    }
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.headerContainerneut}>
          <Text style={styles.header}>Neuter Form (Part 2)</Text>
      </View>

      {/* White Container */}
      <View style={styles.whiteContainer}>
        <ScrollView
        contentContainerStyle={styles.scrollViewContainer} 
        nestedScrollEnabled={true} // Enable this on Android
        >
        {/* Green Container */}
        <View style={styles.greenContainer}>
          <Text style={styles.greenText}>Input "N/A" if information is unavailable</Text>
        </View>
  
        {/* Container for Date and District */}
        <View style={styles.rowContainer}>
          {/* Owner Container */}
          <Text style={styles.headerText}>Pet Owner</Text>
        </View>
  
        <View style={styles.rowContainer2}>
          {/* Patient's name Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Patient's Name</Text>
            <TextInput
              style={styles.textBox2}
              placeholder="Name"
              value={name}
              onChangeText={handleNameChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>
        </View>

        {/* Container for Barangay and Purok */}
        <View style={styles.rowContainer2}>
          {/* Purok Container */}
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Species</Text>
                <DropDownPicker
                    open={isSpeciesOpen}
                    value={speciesValue}
                    items={[
                        { label: 'Canine', value: 'Canine' },
                        { label: 'Feline', value: 'Feline' },
                    ]}
                    placeholder="Please select first"
                    setOpen={handleSpeciesOpen}
                    setValue={handleSpeciesChange}
                    listMode="SCROLLVIEW" // Ensure the internal list is a ScrollView
                />
          </View>
        </View>
  
        {/* Container for Procedure*/}
        <View style={styles.rowContainer2}>
          <View style={styles.dropdownContainer}>
          <Text style={styles.labelText}>Sex</Text>
                <DropDownPicker
                    open={isSexOpen}
                    value={sexValue}
                    items={[
                        { label: 'Male', value: 'Male' },
                        { label: 'Female', value: 'Female' },
                    ]}
                    placeholder="Please select first"
                    setOpen={handleSexOpen}
                    setValue={handleSexChange}
                    listMode="SCROLLVIEW" // Ensure the internal list is a ScrollView
                />
          </View>

          {/* Sex Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText]}>Breed</Text>
                <TextInput
                    style={styles.textBox}
                    placeholder="Breed"
                    value={breed}
                    onChangeText={handleBreedChange}  // Handle text changes
                    // Additional TextInput props can be added as needed
            />
          </View>
        </View>
  
        <View style={styles.rowContainer2}>
        {/* Age Label and Text */}
          <View style={styles.labelContainer}>
              <Text style={styles.labelText}>Age</Text>
              <TextInput
                style={styles.textBox}
                placeholder="8 months old"
                value={age}
                onChangeText={handleAgeChange}  // Handle text changes
                // Additional TextInput props can be added as needed
              />
            </View>
          
            {/* No. of Dog Label Text */}
            <View style={styles.labelContainer}>  
              <Text style={styles.labelText}>No. of Dog (Household)</Text>
              <TextInput
                style={styles.textBox}
                placeholder="8"
                value={pets}
                onChangeText={handlePetsChange}  // Handle text changes
                keyboardType="numeric" // Restricts input to numeric characters
                // Additional TextInput props can be added as needed
              />
            </View>
          </View>
          
          {/* Container for No. of Cat Label Text */}
          <View style={styles.rowContainer2}>
            {/* No. of Dog Label Text Label Text */}
            <View style={styles.labelContainer}>  
              <Text style={styles.labelText}>No. of Cat (Household)</Text>
              <TextInput
                style={styles.textBox}
                placeholder="0"
                value={cat}
                onChangeText={handleCatChange}  // Handle text changes
                keyboardType="numeric" // Restricts input to numeric characters
                // Additional TextInput props can be added as needed
              />
            </View>
          </View>

          {/* Container for Back and Next Number */}
          <View style={styles.rowContainer2}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                // Handle back button press
                // You can navigate to the previous screen or perform any other action
                navigation.navigate('Neuter_Form');
              }}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>

            {/* Next Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmitPress}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
          {/* Modal to check if all fields are inputted */}
          <Modal isVisible={isModalVisible}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                Please fill in all fields before proceeding.
              </Text>
              <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Modal isVisible={isConfirmModalVisible}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Are you sure of your answers?</Text>
              <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  toggleConfirmModal(); // Close the modal
                  submitForm(); // Submit the form
                }}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={styles.modalButton}
                  onPress={toggleConfirmModal} // Close the modal
                >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
             </View>
            </View>
          </Modal>

          {/* Success Modal */}
          <Modal isVisible={isSuccessModalVisible}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Form submitted successfully!</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setSuccessModalVisible(false); // Close the modal
                  navigateAfterSubmit(); // Navigate after the modal is closed
                }}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          {/* Update Success Modal */}
          <Modal isVisible={isUpdateSuccessModalVisible}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Form updated successfully!</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setUpdateSuccessModalVisible(false); // Close the modal
                  navigateAfterSubmit(); // Navigate after the modal is closed
                }}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </View>
  );
  
};

export default Neuter_Form2;
