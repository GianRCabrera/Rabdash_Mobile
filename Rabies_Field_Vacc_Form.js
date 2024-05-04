import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView, // Import ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker'; // Add this import
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import { styles } from './styles/forms';

// ... (other imports and code)
const Rabies_Field_Vacc_Form = () => {

  const [user, setUser] = useState(null);
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null); // Add this line to handle editable item

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [districtValue, setDistrictValue] = useState(null);

  const [barangayValue, setBarangayValue] = useState('');
  const [purokValue, setPurokValue] = useState('');
  const [vaccinatorValue, setVaccinatorValue] = useState('');
  const [owner_nameValue, setOwner_nameValue] = useState('');
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [addressValue, setAddressValue] = useState('');
  const [isSexOpen, setIsSexOpen] = useState(false);
  const [sexValue, setSexValue] = useState(null);
  const [contactValue, setContactValue] = useState('');

  const [isModalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

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
    setIsSexOpen(false);
  };

  const handleSexOpen = () => {
    setIsSexOpen(!isSexOpen);
    setIsDistrictOpen(false);
  };

  const handleDistrictChange = (value) => {
    setDistrictValue(value);
  };

  // Function to handle changes in the "Barangay" TextInput
  const handleBarangayChange = (text) => {
    setBarangayValue(text);
  };
  const handlePurokChange = (text) => {
    setPurokValue(text);
  };
  const handleVaccinatorChange = (text) => {
    setVaccinatorValue(text);
  };
  const handleOwner_nameChange = (text) => {
    setOwner_nameValue(text);
  };
  const handleAddressChange = (text) => {
    setAddressValue(text);
  };

  const handleSexChange = (value) => {
    setSexValue(value);
  };

  const showTimePicker = () => {
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };

  const handleTimeConfirm = (time) => {
    setSelectedTime(time);
    hideTimePicker();
  };

  const handleContactChange = (text) => {
    setContactValue(text);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
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
      const adjustedDate = new Date(item.date);
      adjustedDate.setDate(adjustedDate.getDate() + 1);

      // Autofill fields if coming from archives
      setSelectedDate(adjustedDate);
      setDistrictValue(item.district);
      setBarangayValue(item.barangay);
      setPurokValue(item.purok);
      setVaccinatorValue(item.vaccinator);
      setSelectedTime(item.timeStart ? new Date(`1970-01-01T${item.timeStart}Z`) : null);
      setOwner_nameValue(item.ownerName);
      setAddressValue(item.address);
      setSexValue(item.sex);
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
      vaccinatorValue === '' ||
      selectedTime === null ||
      owner_nameValue === '' ||
      addressValue === '' ||
      sexValue === null ||
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
          vaccinator: vaccinatorValue,
          timeStart: selectedTime.toISOString(),
          ownerName: owner_nameValue,
          address: addressValue,
          sex: sexValue,
          contactNo: contactValue,
        };
        navigation.navigate('Rabies_Field_Vacc_Form2', {
          formData,
          petData: editableItem, // Pass along pet-related data from archives if editing
          fromArchive: !!editableItem,
        });
      } else {
        // New entry: Pass along the filled data without petData
        navigation.navigate('Rabies_Field_Vacc_Form2', {
          date: selectedDate,
          district: districtValue,
          barangay: barangayValue,
          purok: purokValue,
          vaccinator: vaccinatorValue,
          timeStart: selectedTime,
          ownerName: owner_nameValue,
          address: addressValue,
          sex: sexValue,
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
        case 'Field_vacc_archives':
          navigation.navigate('Field_vacc_archives'); // Replace 'ArchiveScreen' with your actual archive screen name
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
      <Text style={styles.header}>Rabies Field Vaccination Form</Text>
  
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
  
        {/* Container for Vaccinator and Time */}
        <View style={styles.rowContainer2}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Vaccinator/s</Text>
            <TextInput
              style={styles.textBox}
              placeholder="Juan Dela Cruz"
              value={vaccinatorValue}  // Set the value from the state
              onChangeText={handleVaccinatorChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>
  
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Time Started:</Text>
            <TouchableOpacity onPress={showTimePicker}>
              <Text style={styles.textBox}>
                {selectedTime
                  ? selectedTime.toLocaleTimeString()
                  : 'Select Time'}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              onConfirm={handleTimeConfirm}
              onCancel={hideTimePicker}
            />
          </View>
        </View>
  
        <View style={styles.rowContainer2}>
          <Text style={styles.headerText}>Owner's Profile</Text>
        </View>

        <View style={styles.rowContainer2}>
        {/* Name Label and Text */}
          <View style={styles.labelContainer}>
              <Text style={styles.labelText}>Name</Text>
              <TextInput
                style={styles.textBox}
                placeholder="John Cena"
                value={owner_nameValue}  // Set the value from the state
                onChangeText={handleOwner_nameChange}  // Handle text changes
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
              onPress={handleBackPress}
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

            {/* Modal to check if all fields are inputted and Modal to display error message */}
            <Modal isVisible={isModalVisible}>
              <View style={styles.modalContainer}>
              <Text style={styles.modalText}>{errorMessage}</Text>
              <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
              </View>
            </Modal>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Rabies_Field_Vacc_Form;
