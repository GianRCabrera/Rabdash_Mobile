import React, { useState, useEffect } from 'react';
import { View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Modal from 'react-native-modal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import styles from './styles/submitforms3';

const BudgetForm = () => {
  const [user, setUser] = useState(null);
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null); // Add this line to handle editable item

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);

  const apiURL = process.env.EXPO_PUBLIC_URL;

  //const [selectedYear, setSelectedYear] = useState(null);

  const navigation = useNavigation();

  const [budgetValue, setBudgetValue] = useState('');
  const [costvaxValue, setCostvaxValue] = useState('');

  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isUpdateSuccessModalVisible, setUpdateSuccessModalVisible] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

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
    setSelectedYear(date);
  };

  const handleBudgetChange = (text) => {
    setBudgetValue(text);
  };

  const handleCostvaxChange = (text) => {
    setCostvaxValue(text);
  };

  useEffect(() => {
    const { item, fromArchive } = route.params || {};
    if (fromArchive && item) {
      // Assuming 'year' in your item is just the year part and needs to be converted to a Date object
      const yearDate = new Date(item.year, 0); // Assuming item.year is something like '2022', '0' for January
  
      setSelectedYear(yearDate);
      setBudgetValue(item.budget.toString()); // Convert to string if necessary
      setCostvaxValue(item.costvax.toString()); // Convert to string if necessary
  
      // Set editableItem state to the item passed from archives
      setEditableItem(item);
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
    selectedYear === null ||
    budgetValue === '' ||
    costvaxValue === '' 
   ) {
     toggleModal();
   } else {
      // ... (existing code)
      toggleConfirmModal();
   }
 };


 const submitForm = () => {

  const submitUrl = `${apiURL}/submitBudgetForm`;

   const editUrl = `${apiURL}/editBudgetForm`;

   // Prepare the data for submission
   const formData = {
    year: selectedYear.getFullYear().toString(), // Extract the year part as a string
    budget: budgetValue,
    costvax: costvaxValue,
  };

  // Check if editing (editableItem is not null) or creating new
  const isEditing = editableItem !== null;
  const apiUrl = isEditing ? editUrl : submitUrl;

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
    navigation.navigate('BudgetFormArchive');
  } else {
    // If it's a new entry, navigate to VetInputForms
    navigation.navigate('VetInputForms');
  }
};

    return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
          <Text style={styles.header}>Budget Form</Text>
      </View>

       {/* White Container */}
    <View style={styles.whiteContainer}>
    <ScrollView>
      <View style={styles.greenContainer}>
          <Text style={styles.greenText}>Input "N/A" if information is unavailable</Text>
      </View>

      {/* Container for Period */}
      <View style={styles.rowContainer}>
          {/* Date Container */}
          <View style={styles.labelContainer}>
          <Text style={styles.labelText}>Period</Text>
          <TouchableOpacity onPress={showDatePicker}>
            <Text style={styles.textBox}>
            {selectedYear instanceof Date ? selectedYear.getFullYear().toString() : 'Select Date'}
            </Text>
            </TouchableOpacity>

            <DateTimePickerModal
             isVisible={isDatePickerVisible}
             mode="year"
             date={new Date()} // Set an initial date with the current year
             onConfirm={handleDateConfirm}
             onCancel={hideDatePicker}
            /> 
          </View>
        </View>

        <View style={styles.rowContainer2}>
             {/* Budget Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Annual Budget</Text>
            <TextInput
              style={styles.textBox}
              placeholder="0"
              value={budgetValue}  // Set the value from the state
              onChangeText={handleBudgetChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
            </View>
        </View>

        <View style={styles.rowContainer2}>
             {/* Annual Cost of Vaccine Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Annual Cost of Vaccine</Text>
            <TextInput
              style={styles.textBox}
              placeholder="Annual Cost of Vaccine"
              value={costvaxValue}  // Set the value from the state
              onChangeText={handleCostvaxChange}  // Handle text changes
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
              <TouchableOpacity style={styles.modalButton}  onPress={toggleModal}>
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

export default BudgetForm;
