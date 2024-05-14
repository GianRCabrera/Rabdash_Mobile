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
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import styles from './styles/submitform';

const AnimalControlForm = () => {
  const [user, setUser] = useState(null);
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null); // Add this line to handle editable item

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [isDatePicker2Visible, setDatePicker2Visibility] = useState(false);
  const [selectedDate2, setSelectedDate2] = useState(null);

  const [cageNumberValue, setCageNumberValue] = useState('');
  const [impHeadsValue, setImpHeadsValue] = useState('');
  const [claimedHeadsValue, setClaimedHeadsValue] = useState('');

  const [isDatePicker3Visible, setDatePicker3Visibility] = useState(false);
  const [selectedDate3, setSelectedDate3] = useState(null);

  const [euthHeadsValue, setEuthHeadsValue] = useState('');

  const [isDatePicker4Visible, setDatePicker4Visibility] = useState(false);
  const [selectedDate4, setSelectedDate4] = useState(null);

  const [chiefValue, setChiefValue] = useState('');
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  const navigation = useNavigation();

  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isUpdateSuccessModalVisible, setUpdateSuccessModalVisible] = useState(false);

  const apiURL = process.env.EXPO_PUBLIC_URL;

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

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

  const showDatePicker2 = () => {
    setDatePicker2Visibility(true);
  };

  const hideDatePicker2 = () => {
    setDatePicker2Visibility(false);
  };

  const handleDateConfirm2 = (date2) => {
    hideDatePicker2();
    // Do something with the selected date (e.g., update state)
    setSelectedDate2(date2);
  };

  const showDatePicker3 = () => {
    setDatePicker3Visibility(true);
  };

  const hideDatePicker3 = () => {
    setDatePicker3Visibility(false);
  };

  const handleDateConfirm3 = (date3) => {
    hideDatePicker3();
    // Do something with the selected date (e.g., update state)
    setSelectedDate3(date3);
  };
  
  const showDatePicker4 = () => {
    setDatePicker4Visibility(true);
  };

  const hideDatePicker4 = () => {
    setDatePicker4Visibility(false);
  };

  const handleDateConfirm4 = (date4) => {
    hideDatePicker4();
    // Do something with the selected date (e.g., update state)
    setSelectedDate4(date4);
  };

  // Function to handle changes in the "Barangay" TextInput
  const handleCageNumberChange = (text) => {
    setCageNumberValue(text);
  };
  const handleImpHeadsChange = (text) => {
    setImpHeadsValue(text);
  };
  const handleClaimedHeadsChange = (text) => {
    setClaimedHeadsValue(text);
  };
  const handleEuthHeadsChange = (text) => {
    setEuthHeadsValue(text);
  };
  const handleChiefChange = (text) => {
    setChiefValue(text);
  };

  useEffect(() => {
    const { item, fromArchive } = route.params || {};
    if(fromArchive && item){
      const adjustedDate = new Date(item.date1);
      adjustedDate.setDate(adjustedDate.getDate() + 1);

      const adjustedDate2 = new Date(item.date2);
      adjustedDate2.setDate(adjustedDate2.getDate() + 1);

      const adjustedDate3 = new Date(item.date3);
      adjustedDate3.setDate(adjustedDate3.getDate() + 1);

      const adjustedDate4 = new Date(item.date4);
      adjustedDate4.setDate(adjustedDate4.getDate() + 1);
   
      console.log("Editing item:", item); // Check the item's values

      setSelectedDate(adjustedDate);
      setCageNumberValue(item.cageNum);
      setImpHeadsValue(item.impHeads.toString());
      setSelectedDate2(adjustedDate2);
      setClaimedHeadsValue(item.claimedHeads.toString());
      setSelectedDate3(adjustedDate3);
      setEuthHeadsValue(item.euthHeads.toString());
      setSelectedDate4(adjustedDate4);
      setChiefValue(item.chief);

      // Additional logic to handle editable item from archives
      if (route.params?.fromArchive && route.params?.item) {
        // Set editableItem state to the item passed from archives
        setEditableItem(route.params.item);
      }
  
    }
   }, [route.params]);

   const handleBackPress = () => {
    const backTo = route.params?.from;
    switch (backTo) {
      case 'ArchiveMenu':
        navigation.navigate('ArchiveMenu');
        break;
      case 'VetInputForms':
        navigation.navigate('VetInputForms');
        break;
      default:
        navigation.goBack();
    }
  };

  const handleSubmitPress = () => {
     // Check if all fields are filled
   if (
    selectedDate === null ||
    cageNumberValue === '' ||
    impHeadsValue === '' ||
    selectedDate2 === null ||
    claimedHeadsValue === '' ||
    selectedDate3 === null ||
    euthHeadsValue === '' ||
    selectedDate4 === null ||
    chiefValue === ''
   ) {
     toggleModal();
   } else {
      // ... (existing code)
      toggleConfirmModal();
   }
};

const formatDate = (date) => {
  if (!date) return ''; // Return an empty string or a default value as needed
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

const submitForm = () => {

  // Define API endpoints or actions for new entry and edit
  //const submitUrl = 'http://192.168.1.211:3000/submitAnimalControlForm';
  //const submitUrl = 'http://192.168.1.7:3000/submitAnimalControlForm';

  //const editUrl = 'http://192.168.1.211:3000/editAnimalControlForm';
  //const editUrl = 'http://192.168.1.7:3000/editAnimalControlForm';

  // Prepare the data for submission
  const formData = {
    date1: formatDate(selectedDate),
    cageNum: cageNumberValue,
    impHeads: impHeadsValue,
    date2: formatDate(selectedDate2),
    claimedHeads: claimedHeadsValue,
    date3: formatDate(selectedDate3),
    euthHeads: euthHeadsValue,
    date4: formatDate(selectedDate4),
    chief: chiefValue,
  };

  // Check if editing (editableItem is not null) or creating new
  const isEditing = editableItem !== null;
  const apiUrl = isEditing ? `${apiURL}/editAnimalControlForm` : `${apiURL}/submitAnimalControlForm`;

  // If editing, include the ID in the formData
  if (isEditing) {
    formData.id = editableItem.id;
  }

  // Perform API call
  axios.post(apiUrl, formData)
  .then(response => {
      console.log(response.data);
      // Navigate back or refresh list as needed
      if (isEditing) {
        setUpdateSuccessModalVisible(true); // Show update success modal for edits
      } else {
        setSuccessModalVisible(true); // Show success modal for new entries
      }
  })
  .catch(error => {
      console.error('Error submitting form:', error);
  });
};

// Function to handle navigation after form submission
const navigateAfterSubmit = () => {
  if (editableItem) { // Check if editableItem is not null
    // If it's an edit, navigate to BudgetFormArchive
    navigation.navigate('AnimalControlArchives');
  } else {
    // If it's a new entry, navigate to VetInputForms
    navigation.navigate('VetInputForms');
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.headerContaineranimal}>
          <Text style={styles.header}>Animal Control & Rehababilitation</Text>
      </View>
  
      {/* White Container */}
      <View style={styles.whiteContainer}>
      <ScrollView>

        {/* Green Container */}
        <View style={styles.greenContainer}>
          <Text style={styles.greenText}>Input "N/A" if information is unavailable</Text>
        </View>
  
        {/* Container for Date and Cage Number */}
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

          {/* Cage Number Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Cage Number:</Text>
            <TextInput
              style={styles.textBox}
              placeholder="3"
              value={cageNumberValue}  // Set the value from the state
              onChangeText={handleCageNumberChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>
        </View>

        <View style={styles.rowContainer2}>
          <Text style={styles.headerText}>Impounded</Text>
        </View>
  
        {/* Container for Impounded Heads and Date */}
        <View style={styles.rowContainer2}>
          {/* Impunded Heads Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>No. of Heads:</Text>
            <TextInput
              style={styles.textBox}
              placeholder="3"
              value={impHeadsValue}  // Set the value from the state
              onChangeText={handleImpHeadsChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>
          
            {/* Date Container */}
            <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Date:</Text>
            <TouchableOpacity onPress={showDatePicker2}>
                <Text style={styles.textBox}>
                {selectedDate2 ? selectedDate2.toDateString() : 'Select Date'}
                </Text>
            </TouchableOpacity>
            <DateTimePickerModal
                isVisible={isDatePicker2Visible}
                mode="date"
                onConfirm={handleDateConfirm2}
                onCancel={hideDatePicker2}
            /> 
            </View>
        </View>

        <View style={styles.rowContainer2}>
          <Text style={styles.headerText}>Claimed</Text>
        </View>
  
        {/* Container for No. of Heads and Date */}
        <View style={styles.rowContainer2}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>No. of Heads</Text>
            <TextInput
              style={styles.textBox}
              placeholder="4"
              value={claimedHeadsValue}  // Set the value from the state
              onChangeText={handleClaimedHeadsChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>
  
          {/* Date Container */}
          <View style={styles.labelContainer}>
          <Text style={styles.labelText}>Date:</Text>
          <TouchableOpacity onPress={showDatePicker3}>
            <Text style={styles.textBox}>
              {selectedDate3 ? selectedDate3.toDateString() : 'Select Date'}
            </Text>
          </TouchableOpacity>
           <DateTimePickerModal
            isVisible={isDatePicker3Visible}
            mode="date"
            onConfirm={handleDateConfirm3}
            onCancel={hideDatePicker3}
          /> 
          </View>
        </View>
  
        <View style={styles.rowContainer2}>
          <Text style={styles.headerText}>Euthanized</Text>
        </View>

        <View style={styles.rowContainer2}>
        {/* Number of Heads Label and Date */}
          <View style={styles.labelContainer}>
              <Text style={styles.labelText}>No. of Heads:</Text>
              <TextInput
                style={styles.textBox}
                placeholder="1"
                value={euthHeadsValue}  // Set the value from the state
                onChangeText={handleEuthHeadsChange}  // Handle text changes
                // Additional TextInput props can be added as needed
              />
            </View>
          
            {/* Date Container */}
            <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Date:</Text>
            <TouchableOpacity onPress={showDatePicker4}>
                <Text style={styles.textBox}>
                {selectedDate4 ? selectedDate4.toDateString() : 'Select Date'}
                </Text>
            </TouchableOpacity>
            <DateTimePickerModal
                isVisible={isDatePicker4Visible}
                mode="date"
                onConfirm={handleDateConfirm4}
                onCancel={hideDatePicker4}
            /> 
            </View>
          </View>
          
          {/* Container for Sex and Contact Number */}
          <View style={styles.rowContainer2}>
            {/* Chief of Operation/Team Leader* Label Text */}
            <View style={styles.labelContainer}>  
              <Text style={styles.labelText}>Chief of Operation/Team Leader*</Text>
              <TextInput
                style={styles.textBox2}
                placeholder=""
                value={chiefValue}  // Set the value from the state
                onChangeText={handleChiefChange}  // Handle text changes
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

export default AnimalControlForm;
