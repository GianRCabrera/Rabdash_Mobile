import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,  // Add this import
  Platform,  // Add this import
  ScrollView,  // Import ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker'; // Add this import
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import styles from './styles/submitform';

const Rabies_Exposure_Form2 = () => {

  const [user, setUser] = useState(null);

  const [route1, setRoute1] = useState('');
  const [brand, setBrand] = useState('');
  const [remarks, setRemarks] = useState('');

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);

  const [isWashingOpen, setIsWashingOpen] = useState(false);
  const [washingValue, setWashingValue] = useState(null);

  const [isDateTimePickerVisible, setDateTimePickerVisibility] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const [isDateTimePickerVisible2, setDateTimePickerVisibility2] = useState(false);
  const [selectedDateTime2, setSelectedDateTime2] = useState(null);

  const [isDateTimePickerVisible3, setDateTimePickerVisibility3] = useState(false);
  const [selectedDateTime3, setSelectedDateTime3] = useState(null);

  const [isDateTimePickerVisible4, setDateTimePickerVisibility4] = useState(false);
  const [selectedDateTime4, setSelectedDateTime4] = useState(null);

  const [isDateTimePickerVisible5, setDateTimePickerVisibility5] = useState(false);
  const [selectedDateTime5, setSelectedDateTime5] = useState(null);

  const [isDateTimePickerVisible6, setDateTimePickerVisibility6] = useState(false);
  const [selectedDateTime6, setSelectedDateTime6] = useState(null);

  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [outcomeValue, setOutcomeValue] = useState(null);
  
  const [isBitingStatusOpen, setIsBitingStatusOpen] = useState(false);
  const [bitingStatusValue, setBitingStatusValue] = useState(null);

  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isUpdateSuccessModalVisible, setUpdateSuccessModalVisible] = useState(false);

  const [submissionResponse, setSubmissionResponse] = useState(null);
  const [isFormEdit, setIsFormEdit] = useState(false);


  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  const navigation = useNavigation();

  const apiURL = process.env.EXPO_PUBLIC_URL;

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const showDateTimePicker = () => {
    setDateTimePickerVisibility(true);
  };

  const hideDateTimePicker = () => {
    setDateTimePickerVisibility(false);
  };

  const handleDateTimeConfirm = (dateTime) => {
    hideDateTimePicker();
    // Do something with the selected date (e.g., update state)
    setSelectedDateTime(dateTime);
  };

  const showDateTimePicker2 = () => {
    setDateTimePickerVisibility2(true);
  };

  const hideDateTimePicker2 = () => {
    setDateTimePickerVisibility2(false);
  };

  const handleDateTimeConfirm2 = (dateTime2) => {
    hideDateTimePicker2();
    // Do something with the selected date (e.g., update state)
    setSelectedDateTime2(dateTime2);
  };

  const showDateTimePicker3 = () => {
    setDateTimePickerVisibility3(true);
  };

  const hideDateTimePicker3 = () => {
    setDateTimePickerVisibility3(false);
  };

  const handleDateTimeConfirm3 = (dateTime3) => {
    hideDateTimePicker3();
    // Do something with the selected date (e.g., update state)
    setSelectedDateTime3(dateTime3);
  };

  const showDateTimePicker4 = () => {
    setDateTimePickerVisibility4(true);
  };

  const hideDateTimePicker4 = () => {
    setDateTimePickerVisibility4(false);
  };

  const handleDateTimeConfirm4 = (dateTime4) => {
    hideDateTimePicker4();
    // Do something with the selected date (e.g., update state)
    setSelectedDateTime4(dateTime4);
  };

  const showDateTimePicker5 = () => {
    setDateTimePickerVisibility5(true);
  };

  const hideDateTimePicker5 = () => {
    setDateTimePickerVisibility5(false);
  };

  const handleDateTimeConfirm5 = (dateTime5) => {
    hideDateTimePicker5();
    // Do something with the selected date (e.g., update state)
    setSelectedDateTime5(dateTime5);
  };

  const showDateTimePicker6 = () => {
    setDateTimePickerVisibility6(true);
  };

  const hideDateTimePicker6 = () => {
    setDateTimePickerVisibility6(false);
  };

  const handleDateTimeConfirm6 = (dateTime6) => {
    hideDateTimePicker6();
    // Do something with the selected date (e.g., update state)
    setSelectedDateTime6(dateTime6);
  };

  const handleCategoryOpen = () => {
    setIsCategoryOpen(!isCategoryOpen);
    setIsWashingOpen(false);
    setIsOutcomeOpen(false);
    setIsBitingStatusOpen(false);
  };

  const handleWashingOpen = () => {
    setIsWashingOpen(!isWashingOpen);
    setIsCategoryOpen(false);
    setIsOutcomeOpen(false);
    setIsBitingStatusOpen(false);
  };

  const handleOutcomeOpen = (open) => {
    setIsOutcomeOpen(!isOutcomeOpen);
    setIsBitingStatusOpen(false);
    setIsWashingOpen(false);
    setIsCategoryOpen(false);
  };
  
  const handleBitingStatusOpen = (open) => {
    setIsBitingStatusOpen(!isBitingStatusOpen);
    setIsOutcomeOpen(false);
    setIsWashingOpen(false);
    setIsCategoryOpen(false);  };

  const handleCategoryChange = (value) => {
    setCategoryValue(value);
  };

  const handleWashingChange = (value) => {
    setWashingValue(value);
  };

  const handleOutcomeChange = (value) => {
    setOutcomeValue(value);
  };

  const handleBitingStatusChange = (value) => {
    setBitingStatusValue(value);
  };

  const handleBrandChange = (text) => {
    setBrand(text);
  };
  const handleRoute1Change = (text) => {
    setRoute1(text);
  };

  const handleRemarksChange = (text) => {
    setRemarks(text);
  };

  const route = useRoute();

  useEffect(() => {
    // Check if route.params exists before accessing its properties
    if (route.params) {
      const {
        regNo,
        regDate,
        name,
        address,
        age,
        sex,
        expDate,
        place,
        typeAnimal,
        typeBNB,
        site
      } = route.params;

      // Print the data in the console
      console.log('Registration Number:', regNo);
      console.log('Regitration Date:', regDate);
      console.log('Name:', name);
      console.log('Address:', address);
      console.log('Age:', age);
      console.log('Sex:', sex);
      console.log('Expiration Date:', expDate);
      console.log('Place (Where the biting occurred):', place);
      console.log('Type of Animal:', typeAnimal);
      console.log('Type (B/NB):', typeBNB);
      console.log('Site (Body parts):', site)
      console.log('New Entry');

      // You can perform any other actions with the data here
    }

    //Editing Version path
   // Ensure formData exists and then access its properties
   if (route.params?.formData) {
    const {
     id,
     regNo,
     regDate,
     name,
     address,
     age,
     sex,
     expDate,
     place,
     typeAnimal,
     typeBNB,
     site
    } = route.params.formData;
    // Print the data in the console
    console.log('ID:', id);
    console.log('Registration Number:', regNo);
    console.log('Regitration Date:', regDate);
    console.log('Name:', name);
    console.log('Address:', address);
    console.log('Age:', age);
    console.log('Sex:', sex);
    console.log('Expiration Date:', expDate);
    console.log('Place (Where the biting occurred):', place);
    console.log('Type of Animal:', typeAnimal);
    console.log('Type (B/NB):', typeBNB);
    console.log('Site (Body parts):', site)
  }
  
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

  // Ensure autofill functionality
  const { petData } = route.params || {};

    if (petData) {
      setCategoryValue(petData.category || '');
      setWashingValue(petData.washing || '');
      setSelectedDateTime(formatDateTime(petData.RIG));
      setRoute1(petData.route || null);
      // Convert all date strings to Date objects
      setSelectedDateTime2(formatDateTime(petData.d0));
      setSelectedDateTime3(formatDateTime(petData.d3));
      setSelectedDateTime4(formatDateTime(petData.d7));
      setSelectedDateTime5(formatDateTime(petData.d14));
      setSelectedDateTime6(formatDateTime(petData.d28));
      setBrand(petData.brand|| '');
      setOutcomeValue(petData.outcome || ''); // Make sure 'outcome' matches the property name in petData
      setBitingStatusValue(petData.bitingStatus || ''); // Make sure 'bitingStatus' matches the property name in petData
      setRemarks(petData.remarks || '');
  }
}, [route.params]); // Run this effect whenever route.params changes

  const handleSubmitPress = () => {
    // Check if all fields are filled
   if (
    // name === '' ||
    categoryValue === null ||
    washingValue === null ||
    selectedDateTime == null ||
    route1 == "" ||
    selectedDateTime2 == null ||
    selectedDateTime3 == null ||
    selectedDateTime3 == null ||
    selectedDateTime4 == null ||
    selectedDateTime5 == null ||
    selectedDateTime6 == null ||
    brand === '' ||
    outcomeValue === null ||
    bitingStatusValue === null ||
    remarks === ''
   ) {
     toggleModal();
   } else {
      // ... (existing code)
      toggleConfirmModal();
   }
 };

 const submitForm = () => {
  // Extract initial data passed to Field_Vac_Form2
  const formData = route.params?.formData || {};
  const isEdit = Boolean(formData?.id);

  // Ensure formData fields are correctly populated
  console.log("Form data for submission:", formData);
  
  // Prepare submission data for both new entries and edits
  let submissionData = {};

  if(isEdit){
    // For edits, merge formData from the previous screen with updates from the current form
    const formData = route.params?.formData;
    submissionData = {
      id: formData.id,
      regNo: formData.regNo,
      regDate: formData.regDate,
      name: formData.name,
      address: formData.address,
      age: formData.age,
      sex: formData.sex,
      expDate: formData.expDate,
      place: formData.place,
      typeAnimal: formData.typeAnimal,
      typeBNB: formData.typeBNB,
      site: formData.site,

      category: categoryValue,
      washing: washingValue,
      RIG:selectedDateTime,
      route:route1,
      d0: selectedDateTime2,
      d3: selectedDateTime3,
      d7: selectedDateTime4,
      d14: selectedDateTime5,
      d28: selectedDateTime6,
      brand,
      outcome: outcomeValue,
      bitingStatus:bitingStatusValue,
      remarks,
    };
  } else {
      // For new entries, use both the data from the previous screen and the current form

      submissionData = {
        regNo: route.params?.regNo,
        regDate: route.params?.regDate,
        name: route.params?.name,
        address: route.params?.address,
        age: route.params?.age,
        sex: route.params?.sex,
        expDate: route.params?.expDate,
        place: route.params?.place,
        typeAnimal: route.params?.typeAnimal,
        typeBNB: route.params?.typeBNB,
        site: route.params?.site,

        category: categoryValue,
        washing: washingValue,
        RIG:selectedDateTime,
        route:route1,
        d0: selectedDateTime2,
        d3: selectedDateTime3,
        d7: selectedDateTime4,
        d14: selectedDateTime5,
        d28: selectedDateTime6,
        brand,
        outcome: outcomeValue,
        bitingStatus:bitingStatusValue,
        remarks,
    };
  }

  const endpoint = isEdit ? `${apiURL}/editRabiesExposureForm` :  `${apiURL}/submitRabiesExposureForm`;

  if (isEdit) {
    // If editing, include the ID in the formData
    formData.id = route.params.formData.id;
  }

  axios.post(endpoint, submissionData)
  .then(response => {
    if (response.data.success) {
      console.log(isEdit ? "Rabies Exposure Form updated successfully." : "Rabies Exposure Form submitted successfully.");
      setSubmissionResponse(response.data); // Set the response data in state
      setIsFormEdit(isEdit); // Set the edit flag in state
      if (isEdit) {
        setUpdateSuccessModalVisible(true); // Show update success modal for edits
      } else {
        setSuccessModalVisible(true); // Show success modal for new entries
      }
    }
  })
  .catch(error => {
    console.error('Error submitting Rabies Exposure form:', error);
  });

};

const navigateAfterSubmit = () => {
  // Use the submissionResponse state directly
  console.log(submissionResponse); // Now you have access to response data
  // Your logic to navigate based on response or the fact of editing
  if (isFormEdit) {
    // Navigate back or refresh list as needed
    navigation.navigate('Rabies_Exposure_Form_Archive'); // Adjust 'ArchiveMenu' to your actual Archive Menu screen name
  } else {
    // Handle navigation for new entry submission
    navigation.navigate('VetInputForms'); // Adjust 'FormMenu' to your actual Form Menu screen name
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome To Rabies Exposure Form (Part 2) </Text>
  
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
          <Text style={styles.headerText}>Post Exposure Prophylaxis (PEP)</Text>
        </View>
  
        {/* Container for Category and Purok */}
        <View style={styles.rowContainer2}>
          {/* Category Container */}
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Category (1, 2, and 3)</Text>
                <DropDownPicker
                    open={isCategoryOpen}
                    value={categoryValue}
                    items={[
                        { label: '1', value: '1' },
                        { label: '2', value: '2' },
                        { label: '3', value: '3'}
                    ]}
                    placeholder="Please select first"
                    setOpen={handleCategoryOpen}
                    setValue={handleCategoryChange}
                    listMode="SCROLLVIEW" // Ensure the internal list is a ScrollView
                />
          </View>

          {/* Category Container */}
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Washing of Bite</Text>
                <DropDownPicker
                    open={isWashingOpen}
                    value={washingValue}
                    items={[
                        { label: 'Yes', value: 'Yes' },
                        { label: 'No', value: 'No' },
                    ]}
                    placeholder="Please select first"
                    setOpen={handleWashingOpen}
                    setValue={handleWashingChange}
                    listMode="SCROLLVIEW" // Ensure the internal list is a ScrollView
                />
          </View>
        </View>
  
        {/* Container for Procedure*/}
        <View style={styles.rowContainer2}>
          {/* Date Container */}
          <View style={styles.labelContainer}>
          <Text style={styles.labelText}>RIG Date Given</Text>
          <TouchableOpacity onPress={showDateTimePicker}>
            <Text style={styles.textBox}>
            {selectedDateTime ? `${selectedDateTime.toLocaleDateString()} ${selectedDateTime.toLocaleTimeString()}`: 'Select Date and Time'} </Text>
          </TouchableOpacity>
           <DateTimePickerModal
            isVisible={isDateTimePickerVisible}
            mode="datetime"
            onConfirm={handleDateTimeConfirm}
            onCancel={hideDateTimePicker}
          /> 
          </View>
        </View>
  
        <View style={styles.rowContainer2}>
          <Text style={styles.headerText}>Tissue Culture Vaccine (Date Given)</Text>
        </View>
  
        <View style={styles.rowContainer2}>
          {/* Route Label */}
          <View style={styles.labelContainer}>
              <Text style={styles.labelText}>Route</Text>
              <TextInput
                style={styles.textBox}
                placeholder=""
                value={route1}
                onChangeText={handleRoute1Change}  // Handle text changes
                // Additional TextInput props can be added as needed
              />
            </View>

          {/* Date Container */}
          <View style={styles.labelContainer}>
          <Text style={styles.labelText}>D0</Text>
          <TouchableOpacity onPress={showDateTimePicker2}>
            <Text style={styles.textBox}>
            {selectedDateTime2 ? `${selectedDateTime2.toLocaleDateString()} ${selectedDateTime2.toLocaleTimeString()}` : 'Select Date and Time'}</Text>
          </TouchableOpacity>
           <DateTimePickerModal
            isVisible={isDateTimePickerVisible2}
            mode="datetime"
            onConfirm={handleDateTimeConfirm2}
            onCancel={hideDateTimePicker2}
          /> 
          </View>
          
            
          </View>
          
          {/* Container for Calendar pickers Text */}
          <View style={styles.rowContainer2}>
            {/* Date Container */}
            <View style={styles.labelContainer}>
            <Text style={styles.labelText}>D3</Text>
            <TouchableOpacity onPress={showDateTimePicker3}>
              <Text style={styles.textBox}>
              {selectedDateTime3 ? `${selectedDateTime3.toLocaleDateString()} ${selectedDateTime3.toLocaleTimeString()}`: 'Select Date and Time'} </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDateTimePickerVisible3}
              mode="datetime"
              onConfirm={handleDateTimeConfirm3}
              onCancel={hideDateTimePicker3}
            /> 
            </View>

            {/* Date Container */}
            <View style={styles.labelContainer}>
            <Text style={styles.labelText}>D7</Text>
            <TouchableOpacity onPress={showDateTimePicker4}>
              <Text style={styles.textBox}>
              {selectedDateTime4 ? `${selectedDateTime4.toLocaleDateString()} ${selectedDateTime4.toLocaleTimeString()}`: 'Select Date and Time'} </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDateTimePickerVisible4}
              mode="datetime"
              onConfirm={handleDateTimeConfirm4}
              onCancel={hideDateTimePicker4}
            /> 
            </View>
          </View>

          <View style = {styles.rowContainer2}>
            {/* Date Container */}
            <View style={styles.labelContainer}>
            <Text style={styles.labelText}>D14</Text>
            <TouchableOpacity onPress={showDateTimePicker5}>
              <Text style={styles.textBox}>
              {selectedDateTime5 ? `${selectedDateTime5.toLocaleDateString()} ${selectedDateTime5.toLocaleTimeString()}`: 'Select Date and Time'} </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDateTimePickerVisible5}
              mode="datetime"
              onConfirm={handleDateTimeConfirm5}
              onCancel={hideDateTimePicker5}
            /> 
            </View>

            {/* Date Container */}
            <View style={styles.labelContainer}>
            <Text style={styles.labelText}>D28</Text>
            <TouchableOpacity onPress={showDateTimePicker6}>
              <Text style={styles.textBox}>
              {selectedDateTime6 ? `${selectedDateTime6.toLocaleDateString()} ${selectedDateTime6.toLocaleTimeString()}`: 'Select Date and Time'} </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDateTimePickerVisible6}
              mode="datetime"
              onConfirm={handleDateTimeConfirm6}
              onCancel={hideDateTimePicker6}
            /> 
            </View>
          </View>

          <View style ={styles.rowContainer2}>
            {/* Brand Text */}
            <View style={styles.labelContainer}>  
              <Text style={styles.labelText}>Brand Name</Text>
              <TextInput
                style={styles.textBox}
                placeholder=""
                value={brand}
                onChangeText={handleBrandChange}  // Handle text changes
                // Additional TextInput props can be added as needed
              />
            </View>

            {/* Outcome Dropdown */}
            <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Outcome (C/Inc/N/D)</Text>
            <DropDownPicker
              open={isOutcomeOpen}
              value={outcomeValue}
              items={[
                { label: 'C', value: 'C' },
                { label: 'Inc', value: 'Inc' },
                { label: 'N', value: 'N' },
                { label: 'D', value: 'D' },
              ]}
              setOpen={handleOutcomeOpen}
              setValue={handleOutcomeChange}
              listMode="SCROLLVIEW" // Ensure the internal list is a ScrollView
              zIndex={3000} // Adjust zIndex to ensure dropdown appears above other components
              zIndexInverse={1000}
            />
            </View>
          </View>

          <View syle ={styles.rowContainer2}>
            {/* Biting Animal Status Dropdown */}
            <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Biting Animal Status (Alive/Dead/Lost)</Text>
            <DropDownPicker
              open={isBitingStatusOpen}
              value={bitingStatusValue}
              items={[
              { label: 'Alive', value: 'Alive' },
              { label: 'Dead', value: 'Dead' },
              { label: 'Lost', value: 'Lost' },
              ]}
            setOpen={handleBitingStatusOpen}
            setValue={handleBitingStatusChange}
            placeholder="Please select first"
            listMode="SCROLLVIEW" // Ensure the internal list is a ScrollView
            zIndex={3000} // Adjust zIndex to ensure dropdown appears above other components
            zIndexInverse={1000}
          />
        </View>

            {/* Remarks Container */}
            <View style={styles.labelContainer}>  
              <Text style={styles.labelText}>Remarks</Text>
              <TextInput
                style={styles.textBox}
                placeholder=""
                value={remarks}
                onChangeText={handleRemarksChange}  // Handle text changes
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
                navigation.navigate('Rabies_Exposure_Form1');
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
              <TouchableOpacity style={styles.modalButton} onPress={toggleConfirmModal}>
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

export default Rabies_Exposure_Form2;
