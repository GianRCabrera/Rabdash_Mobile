import React, { useState, useEffect } from 'react';
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
import { styles } from './styles/forms';

const Rabies_Exposure_Form = () => {

  const [user, setUser] = useState(null);
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null); // Add this line to handle editable item

  const [regNoValue, setRegNoValue] = useState('');

  const [isDateTimePickerVisible, setDateTimePickerVisibility] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const [nameValue, setNameValue] = useState('');
  const [addressValue, setAddressValue] = useState('');
  const [ageValue, setAgeValue] = useState('');

  const [isSexOpen, setIsSexOpen] = useState(false);
  const [sexValue, setSexValue] = useState(null);

  const [isDateTimePickerVisible2, setDateTimePickerVisibility2] = useState(false);
  const [selectedDateTime2, setSelectedDateTime2] = useState(null);

  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [typeValue, setTypeValue] = useState(null);

  const [typeAnimalValue, setTypeAnimalValue] = useState('');
  const [placeValue, setPlaceValue] = useState('');
  const [siteValue, setSiteValue] = useState('');

  const [isModalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();

  const showDateTimePicker = () => {
    setDateTimePickerVisibility(true);
  };

  const hideDateTimePicker = () => {
    setDateTimePickerVisibility(false);
  };

  const handleDateTimeConfirm = (datetime) => {
    hideDateTimePicker();
    // Do something with the selected date (e.g., update state)
    setSelectedDateTime(datetime);
  };

  const showDateTimePicker2 = () => {
    setDateTimePickerVisibility2(true);
  };

  const hideDateTimePicker2 = () => {
    setDateTimePickerVisibility2(false);
  };

  const handleDateTimeConfirm2 = (datetime2) => {
    hideDateTimePicker2();
    // Do something with the selected date (e.g., update state)
    setSelectedDateTime2(datetime2);
  };

  const handleSexOpen = () => {
    setIsSexOpen(!isSexOpen);
    setIsTypeOpen(false);

  };

  const handleTypeOpen = () => {
    setIsTypeOpen(!isTypeOpen);
    setIsSexOpen(false);
  };

  // Function to handle changes in the "Barangay" TextInput
  const handleRegNoChange = (text) => {
    setRegNoValue(text);
  };
  const handleNameChange = (text) => {
    setNameValue(text);
  };
  const handleAgeChange = (text) => {
    setAgeValue(text);
  };
  
  const handleAddressChange = (text) => {
    setAddressValue(text);
  };

  const handleSexChange = (value) => {
    setSexValue(value);
  };

  const handleTypeChange = (value) => {
    setTypeValue(value);
  };

  const handlePlaceChange = (text) => {
    setPlaceValue(text);
  };

  const handleTypeAnimalChange = (text) => {
    setTypeAnimalValue(text);
  };

  const handleSiteChange = (text) => {
    setSiteValue(text);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const formatDateTime = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return null;
  }
  // Subtract 4 hours from the time
  date.setHours(date.getHours() - 4);
  return date;
};

  useEffect(()=>{
    // Conditional Autofill based on 'fromArchive' flag
    const { item, fromArchive } = route.params || {};
    if (fromArchive && item) {
      // Autofill fields if coming from archives
      setRegNoValue(item.regNo.toString()|| '');
      setSelectedDateTime(formatDateTime(item.regDate));
      setNameValue(item.name);
      setAddressValue(item.address);
      setAgeValue(item.age.toString() || ''); // Ensure age is converted to string if it's not already
      setSexValue(item.sex);
      setSelectedDateTime2(formatDateTime(item.expDate));
      setPlaceValue(item.place);
      setTypeAnimalValue(item.typeAnimal);
      setTypeValue(item.typeBNB);
      setSiteValue(item.site);
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
      regNoValue === '' ||
      selectedDateTime === null ||
      nameValue === '' ||
      addressValue === '' ||
      ageValue === '' ||
      sexValue === null ||
      selectedDateTime2 === null ||
      placeValue === '' ||
      typeAnimalValue === '' ||
      typeValue === null ||
      siteValue === ''
    ) {
      toggleModal();
    } else {
      // Determine if it's a new entry or an edit based on editableItem
      if (editableItem){
        const formData = {
          id: editableItem ? editableItem.id : null, // Include the ID from editableItem
          regNo: regNoValue,
          regDate: selectedDateTime,
          name: nameValue,
          address: addressValue,
          age: ageValue,
          sex: sexValue,
          expDate: selectedDateTime2,
          place: placeValue,
          typeAnimal: typeAnimalValue,
          typeBNB: typeValue,
          site: siteValue
        };
      // All fields are filled, proceed to the next screen
      navigation.navigate('Rabies_Exposure_Form2', {
        formData,
          petData: editableItem, // Pass along pet-related data from archives if editing
          fromArchive: !!editableItem,
      });
    } else {
      navigation.navigate('Rabies_Exposure_Form2',{
        regNo: regNoValue,
          regDate: selectedDateTime,
          name: nameValue,
          address: addressValue,
          age: ageValue,
          sex: sexValue,
          expDate: selectedDateTime2,
          place: placeValue,
          typeAnimal: typeAnimalValue,
          typeBNB: typeValue,
          site: siteValue,

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
      <Text style={styles.header}>Rabies Exposure Form </Text>
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
  
        <View style={styles.rowContainer}>
          <Text style={styles.headerText}>Registration</Text>
        </View>

        {/* Container for Date and District */}
        <View style={styles.rowContainer2}>
          {/* Registration Number Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>No.</Text>
            <TextInput
              style={styles.textBox}
              placeholder=""
              value={regNoValue}  // Set the value from the state
              onChangeText={handleRegNoChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>

          {/* Date Container */}
          <View style={styles.labelContainer}>
          <Text style={styles.labelText}>Date</Text>
          <TouchableOpacity onPress={showDateTimePicker}>
            <Text style={styles.textBox}>
              {selectedDateTime ? `${selectedDateTime.toLocaleDateString()} ${selectedDateTime.toLocaleTimeString()}`: 'Select Date and Time'} 
            </Text>
          </TouchableOpacity>
           <DateTimePickerModal
            isVisible={isDateTimePickerVisible}
            mode="datetime"
            onConfirm={handleDateTimeConfirm}
            onCancel={hideDateTimePicker}
          /> 
          </View>
        </View>
  
        {/* Container for Name and Address */}
        <View style={styles.rowContainer2}>

          {/* Purok Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Name of Patient</Text>
            <TextInput
              style={styles.textBox}
              placeholder=""
              value={nameValue}  // Set the value from the state
              onChangeText={handleNameChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>

          {/* Adress Label Text */}
          <View style={styles.labelContainer}>  
              <Text style={styles.labelText}>Address</Text>
              <TextInput
                style={styles.textBox}
                placeholder=""
                value={addressValue}  // Set the value from the state
                onChangeText={handleAddressChange}  // Handle text changes
                // Additional TextInput props can be added as needed
              />
            </View>
        </View>

        <View style={styles.rowContainer2}>
          <Text style={styles.headerText}>History of Exposure</Text>
        </View>
  
        {/* Container for Age and Sex */}
        <View style={styles.rowContainer2}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Age</Text>
            <TextInput
              style={styles.textBox}
              placeholder=""
              value={ageValue}  // Set the value from the state
              onChangeText={handleAgeChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>
  
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
        </View>

        <View style={styles.rowContainer2}>
        {/* Name Date and Place */}
        {/* Date Container */}
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>Date</Text>
          <TouchableOpacity onPress={showDateTimePicker2}>
            < Text style={styles.textBox}>
              {selectedDateTime2 ? `${selectedDateTime2.toLocaleDateString()} ${selectedDateTime2.toLocaleTimeString()}` : 'Select Date and Time'}
            </Text>
          </TouchableOpacity>
           <DateTimePickerModal
            isVisible={isDateTimePickerVisible2}
            mode="datetime"
            onConfirm={handleDateTimeConfirm2}
            onCancel={hideDateTimePicker2}
          /> 
          </View>

          <View style={styles.labelContainer}>
              <Text style={styles.labelText}>Place (Where the biting occurred)</Text>
              <TextInput
                style={styles.textBox}
                placeholder=""
                value={placeValue}  // Set the value from the state
                onChangeText={handlePlaceChange}  // Handle text changes
                // Additional TextInput props can be added as needed
              />
            </View>
          </View>
          
          {/* Container for Animal Type and Type */}
          <View style={styles.rowContainer2}>
            {/* Animal Type Label Text */}
            <View style={styles.labelContainer}>  
              <Text style={styles.labelText}>Type of Animal</Text>
              <TextInput
                style={styles.textBox}
                placeholder=""
                value={typeAnimalValue}  // Set the value from the state
                onChangeText={handleTypeAnimalChange}  // Handle text changes
                // Additional TextInput props can be added as needed
              />
            </View>

            {/* Type (B/NB) Label Text */}
            <View style={styles.dropdownContainer}>
              <Text style={styles.labelText}>Type (B/NB)</Text>
                <DropDownPicker
                  open={isTypeOpen}
                  value={typeValue}
                  items={[
                    { label: 'B', value: 'B' },
                    { label: 'NB', value: 'NB' },
                  ]}
                  placeholder="Please select first"
                  setOpen={handleTypeOpen}
                  setValue={handleTypeChange}
                  listMode="SCROLLVIEW" // Ensure the internal list is a ScrollView
                />
            </View>
          </View>

          {/* Container and Label for Site (Body parts) */}
          <View style={styles.rowcontainer2}>
            <View style={styles.labelContainer}>  
              <Text style={styles.labelText}>Site (Body parts)</Text>
              <TextInput
                style={styles.textBox}
                placeholder=""
                value={siteValue}  // Set the value from the state
                onChangeText={handleSiteChange}  // Handle text changes
                // Additional TextInput props can be added as needed
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
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Rabies_Exposure_Form;
