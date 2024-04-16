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
import DropDownPicker from 'react-native-dropdown-picker'; // Add this import
import axios from 'axios';
import styles from './styles/submitforms3';

const IECForm = () => {
  const [user, setUser] = useState(null);
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null); // Add this line to handle editable item

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [districtValue, setDistrictValue] = useState(null);
  
  const [titleValue, setTitleValue] = useState('');
  const [barangayValue, setBarangayValue] = useState('');
  const [purokValue, setPurokValue] = useState('');
  const [participantValue, setParticipantValue] = useState('');
  const [brochureValue, setBrochureValue] = useState('');
  const [materialValue, setMaterialValue] = useState('');

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
    setSelectedDate(date);
  };

  const handleTitleChange = (text) => {
    setTitleValue(text);
  };

  const handleDistrictOpen = () => {
    setIsDistrictOpen(!isDistrictOpen);
  };

  const handleDistrictChange = (value) => {
    setDistrictValue(value);
  };

  const handleBarangayChange = (text) => {
    setBarangayValue(text);
  };

  const handlePurokChange = (text) => {
    setPurokValue(text);
  };

  const handleParticipantChange = (text) => {
    setParticipantValue(text);
  };

  const handleBrochureChange = (text) => {
    setBrochureValue(text);
  };

  const handleMaterialChange = (text) => {
    setMaterialValue(text);
  };

 useEffect(() => {
  const { item, fromArchive } = route.params || {};

  const adjustedDate = new Date(item.date);
  adjustedDate.setDate(adjustedDate.getDate() + 1);

  if(fromArchive && item){
    // Autofill fields if coming from archives
    setSelectedDate(adjustedDate);
    setTitleValue(item.title);
    setDistrictValue(item.district);
    setBarangayValue(item.barangay);
    setPurokValue(item.purok);
    setParticipantValue(item.participants.toString()); // Ensure conversion to string if necessary
    setBrochureValue(item.brochure);
    setMaterialValue(item.materials.toString()); // Ensure conversion to string if necessary

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
  titleValue === '' ||
  districtValue === null ||
  barangayValue === '' ||
  purokValue === '' ||
  participantValue === '' ||
  brochureValue === '' ||
  materialValue === ''
 ) {
   toggleModal();
 } else {
    // ... (existing code)
    toggleConfirmModal();
 }
};

const submitForm = () => {

  // Define API endpoints or actions for new entry and edit
  const submitUrl = `${apiURL}/submitIECForm`;
  const editUrl = `${apiURL}/editIECForm`;

  // Prepare the data for submission
  const formData = {
    date: selectedDate.toISOString().split('T')[0], // Format date to YYYY-MM-DD
    title: titleValue,
    district: districtValue,
    barangay: barangayValue,
    purok: purokValue,
    participants: participantValue,
    brochure: brochureValue,
    materials: materialValue,
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
    navigation.navigate('IECFormArchive'); // Adjust 'ArchiveMenu' to your actual Archive Menu screen name
  } else {
    navigation.navigate('VetInputForms');
  }
};

    return (
    <View style={styles.container}>
      <Text style={styles.header}>Budget Form</Text>

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
        </View>

        <View style={styles.rowContainer2}>
             {/* Title Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Title</Text>
            <TextInput
              style={styles.textBox}
              placeholder=""
              value={titleValue}  // Set the value from the state
              onChangeText={handleTitleChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
            </View>
        </View>

        <View style={styles.rowContainer2}>
          {/* District Container */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.labelText}>District</Text>
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
            />
          </View>
        </View>
        
        <View style={styles.rowContainer2}>
            {/* Barangay Container */}
            <View style={styles.labelContainer}>
                <Text style={[styles.labelText, { textAlign: 'left' }]}>Barangay</Text>
                <TextInput
                style={styles.textBox}
                placeholder="Enter Barangay"
                value={barangayValue}  // Set the value from the state
                onChangeText={handleBarangayChange}  // Handle text changes
                // Additional TextInput props can be added as needed
                />
            </View>
        </View>

        <View style={styles.rowContainer2}>
             {/* Purok Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Purok</Text>
            <TextInput
              style={styles.textBox}
              placeholder="Purok 1-A"
              value={purokValue}  // Set the value from the state
              onChangeText={handlePurokChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>
        </View>

        <View style={styles.rowContainer2}>
             {/* Participants Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>No. of Participants</Text>
            <TextInput
              style={styles.textBox}
              placeholder="10"
              value={participantValue}  // Set the value from the state
              onChangeText={handleParticipantChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>
        </View>

        <View style={styles.rowContainer2}>
             {/* Brochure Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Brochure(Kind)</Text>
            <TextInput
              style={styles.textBox}
              placeholder="Paper"
              value={brochureValue}  // Set the value from the state
              onChangeText={handleBrochureChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>
        </View>

        <View style={styles.rowContainer2}>
             {/* Materials Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>NO. of Materials</Text>
            <TextInput
              style={styles.textBox}
              placeholder="12"
              value={materialValue}  // Set the value from the state
              onChangeText={handleMaterialChange}  // Handle text changes
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

export default IECForm;
