import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,  // Import ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker'; // Add this import
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import styles from './styles/forms';

const Neuter_Form = () => {

  const [user, setUser] = useState(null);
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null); // Add this line to handle editable item

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [districtValue, setDistrictValue] = useState(null);

  const [barangayValue, setBarangayValue] = useState('');
  const [purokValue, setPurokValue] = useState('');

  const [isProcedureOpen, setIsProcedureOpen] = useState(false);
  const [procedureValue, setProcedureValue] = useState(null);

  const [clientValue, setClientValue] = useState('');
  const [addressValue, setAddressValue] = useState('');
  const [contactValue, setContactValue] = useState('');

  const [isModalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    hideDatePicker();
    // Do something with the selected date (e.g., update state)
    setSelectedDate(date);
  };
  
  const handleDistrictOpen = () => {
    setIsDistrictOpen(!isDistrictOpen);
    setIsProcedureOpen(false);
  };

  const handleProcedureOpen = () => {
    setIsProcedureOpen(!isProcedureOpen);
    setIsDistrictOpen(false);
  };

  const handleDistrictChange = (value) => {
    setDistrictValue(value);
  };

  const handleProcedureChange = (value) => {
    setProcedureValue(value);
  };

  const handleBarangayChange = (text) => {
    setBarangayValue(text);
  };
  const handlePurokChange = (text) => {
    setPurokValue(text);
  };
  const handleClientChange = (text) => {
    setClientValue(text);
  };
  const handleAddressChange = (text) => {
    setAddressValue(text);
  };
  const handleContactChange = (text) => {
    setContactValue(text);
  };

  //const NETWORK_URL = 'http://192.168.1.211:3000/Position';
  //const NETWORK_URL = 'http://192.168.1.7:3000/Position';

  useEffect(() => {
    // Fetch user profile data from the backend
    axios.get(`${apiURL}/Position`)
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Error fetching position:', error);
        // Handle error, e.g., navigate to login screen
      });
    
    // Conditional Autofill based on 'fromArchive' flag
    const { item, fromArchive } = route.params || {};
    if (fromArchive && item) {
      const editDate = new Date(item.date);
      editDate.setDate(editDate.getDate() + 1);

      // Autofill fields if coming from archives
      setSelectedDate(editDate);
      setDistrictValue(item.district);
      setBarangayValue(item.barangay);
      setPurokValue(item.purok);
      setProcedureValue(item.proc);
      setClientValue(item.client);
      setAddressValue(item.address);
      setContactValue(item.contactNo);
    }

    // Additional logic to handle editable item from archives
    if (route.params?.fromArchive && route.params?.item) {
      // Set editableItem state to the item passed from archives
      setEditableItem(route.params.item);
    }
  }, [route.params]);

  const handleNextPress = () => {
    // Check if all fields are filled
    if (
      selectedDate === null ||
      districtValue === null ||
      barangayValue === '' ||
      purokValue === '' ||
      procedureValue === null ||
      clientValue === '' ||
      addressValue === '' ||
      contactValue === '' 
    ) {
      setErrorMessage('Please fill in all fields before proceeding.');
      toggleModal();
    } else if (contactValue.length !== 11) {
      setErrorMessage('Contact number must be exactly 11 digits.');
      toggleModal();
    } else {
        // Determine if it's a new entry or an edit based on editableItem
        if (editableItem) {
          // Editing mode: Prepare data to pass to the next form with existing pet data
          const formData = {
            id: editableItem ? editableItem.id : null, // Include the ID from editableItem
            date: selectedDate.toISOString(),
            district: districtValue,
            barangay: barangayValue,
            purok: purokValue,
            proc: procedureValue,
            client: clientValue,
            address: addressValue,
            contactNo: contactValue,
          };

          navigation.navigate('Neuter_Form2', {
            formData,
            petData: editableItem, // Pass along pet-related data from archives if editing
            fromArchive: !!editableItem,
          });
        }
        else {
          // New entry: Pass along the filled data without petData
          // All fields are filled, proceed to the next screen
          navigation.navigate('Neuter_Form2', {
            date: selectedDate,
            district: districtValue,
            barangay: barangayValue,
            purok: purokValue,
            proc: procedureValue,
            client: clientValue,
            address: addressValue,
            contactNo: contactValue,

            // No need to pass petData for a new entry
            fromArchive: false, // Indicate this is not from archives/edit mode
        });
      }
    }
  };

  const handleBackPress = () => {
    // Default back navigation if no specific source is provided
    const defaultBack = () => {
      navigation.goBack();
    };
  
    // Dynamic navigation based on the source
    const navigateBack = () => {
      const source = route.params?.source;
      switch (source) {
        case 'Neuter_Form_archives':
          navigation.navigate('Neuter_Form_archives'); // Replace 'ArchiveScreen' with your actual archive screen name
          break;
        case 'InputMenu':
          const position = user.position;

          if (position === 'CVO' || position === 'Rabdash') {
            navigation.navigate('VetInputForms');
          } else if (position === 'Private Veterinarian') {
            navigation.navigate('InputForms');
          } else {
            console.warn('Unknown user position:', position);
          }
        break;
        default:
          defaultBack();
          break;
      }
    };
  
    navigateBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Neuter Form</Text>
  
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
          {/* Date Container */}
          <View style={styles.labelContainer}>
          <Text style={styles.labelText}>Date:</Text>
          <TouchableOpacity onPress={showDatePicker}>
            <Text style={styles.textBox}>
              {selectedDate ? selectedDate.toDateString() : 'Select Date'}
            </Text>
          </TouchableOpacity>
           <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
          /> 
          </View>

          {/* District Container */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.labelText}>District:</Text>
            <DropDownPicker
              open={isDistrictOpen}
              value={districtValue}
              items={[
                { label: 'Agdao', value: 'Agdao' },
                { label: 'Baguio', value: 'Baguio' },
                { label: 'Buhangin', value: 'Buhangin' },
                { label: 'Bunawan', value: 'Bunawan' },
                { label: 'Calinan', value: 'Calinan' },
                { label: 'Marilog', value: 'Marilog' },
                { label: 'Paquibato', value: 'Paquibato' },
                { label: 'Poblacion', value: 'Poblacion' },
                { label: 'Talomo', value: 'Talomo' },
                { label: 'Toril', value: 'Toril' },
                { label: 'Tugbok', value: 'Tugbok' },
              ]}
              placeholder="Please select first"
              setOpen={handleDistrictOpen}
              setValue={handleDistrictChange}
              listMode="SCROLLVIEW" // Ensure the internal list is a ScrollView
            />
          </View>
        </View>
  
        {/* Container for Barangay and Purok */}
        <View style={styles.rowContainer2}>
          {/* Barangay Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Barangay:</Text>
            <TextInput
              style={styles.textBox}
              placeholder="Enter Barangay"
              value={barangayValue}  // Set the value from the state
              onChangeText={handleBarangayChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>
          
          {/* Purok Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Purok:</Text>
            <TextInput
              style={styles.textBox}
              placeholder="Enter Purok"
              value={purokValue}  // Set the value from the state
              onChangeText={handlePurokChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>
        </View>
  
        {/* Container for Procedure*/}
        <View style={styles.rowContainer2}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.labelText}>Procedure</Text>
            <DropDownPicker
              open={isProcedureOpen}
              value={procedureValue}
              items={[
                { label: 'Castration', value: 'Castration' },
                { label: 'Spraying', value: 'Spraying' },
              ]}
              placeholder="Please select first"
              setOpen={handleProcedureOpen}
              setValue={handleProcedureChange}
              listMode="SCROLLVIEW" // Ensure the internal list is a ScrollView
            />
          </View>
        </View>
  
        <View style={styles.rowContainer2}>
        {/* Name Label and Text */}
          <View style={styles.labelContainer}>
              <Text style={styles.labelText}>Client</Text>
              <TextInput
                style={styles.textBox}
                placeholder="Name"
                value={clientValue}  // Set the value from the state
                onChangeText={handleClientChange}  // Handle text changes
                // Additional TextInput props can be added as needed
              />
            </View>
          
            {/* Adress Label Text */}
            <View style={styles.labelContainer}>  
              <Text style={styles.labelText}>Address</Text>
              <TextInput
                style={styles.textBox}
                placeholder="Mintal, Davao City"
                value={addressValue}  // Set the value from the state
                onChangeText={handleAddressChange}  // Handle text changes
                // Additional TextInput props can be added as needed
              />
            </View>
          </View>
          
          {/* Container for Sex and Contact Number */}
          <View style={styles.rowContainer2}>
            {/* Adress Label Text */}
            <View style={styles.labelContainer}>  
              <Text style={styles.labelText}>Contact No.</Text>
              <TextInput
                style={styles.textBox}
                placeholder="09123456789"
                value={contactValue}  // Set the value from the state
                onChangeText={handleContactChange}  // Handle text changes
                keyboardType="numeric"  // Set keyboard to numeric
                maxLength={11}  // Set maximum length to 11
              />
            </View>
          </View>

          {/* Container for Back and Next Number */}
          <View style={styles.rowContainer2}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleBackPress}  // Add this line
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>

            {/* Next Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleNextPress}  // Add this line
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
          {/* Modal to check if all fields are inputted and Modal to display error message */}
          <Modal isVisible={isModalVisible}>
            <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </View>
  );
  
};

export default Neuter_Form;
