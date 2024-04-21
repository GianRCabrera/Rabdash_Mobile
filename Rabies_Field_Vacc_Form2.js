import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,  // Add this import
  Platform,  // Add this import
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker'; // Add this import
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import styles from './styles/submitform';

const Rabies_Field_Vacc_Form2 = () => {

  const [user, setUser] = useState(null);
  const route = useRoute();

  const [petName, setpetName] = useState('');
  const [petAge, setpetAge] = useState('');

  const [isSpeciesOpen, setIsSpeciesOpen] = useState(false);
  const [speciesValue, setSpeciesValue] = useState(null);

  const [isAnimalSexOpen, setIsAnimalSexOpen] = useState(false);
  const [AnimalSexValue, setAnimalSexValue] = useState(null);

  const [colorMarkings, setcolorMarkings] = useState('');
  const [cardNumber, setcardNumber] = useState('');

  const [vaccineLotNumber, setvaccineLotNumber] = useState('');
  const [sourceOfVaccine, setsourceOfVaccine] = useState('');

  const [isDateVacPickerVisible, setDateVacPickerVisibility] = useState(false);
  const [selectedDateVac, setSelectedDateVac] = useState(null);

  const [isFinTimePickerVisible, setFinTimePickerVisible] = useState(false);
  const [selectedFinTime, setFinSelectedTime] = useState(null);

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const isEdit = route.params?.formData?.id ? true : false;

  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isUpdateSuccessModalVisible, setUpdateSuccessModalVisible] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  const handlepetNameChange = (text) => {
    setpetName(text);
  };
  const handlepetAgeChange = (text) => {
    setpetAge(text);
  };

  const handlecolorMarkingsChange = (text) => {
    setcolorMarkings(text);
  };
  const handlecardNumberChange = (text) => {
    setcardNumber(text);
  };
  const handlevaccineLotNumberChange = (text) => {
    setvaccineLotNumber(text);
  };
  const handlesourceOfVaccineChange = (text) => {
    setsourceOfVaccine(text);
  };

  const showDateVacPicker = () => {
    setDateVacPickerVisibility(true);
  };

  const hideDateVacPicker = () => {
    setDateVacPickerVisibility(false);
  };

  const handleDateVacConfirm = (date) => {
    hideDateVacPicker();
    // Do something with the selected date (e.g., update state)
    setSelectedDateVac(date);
  };  

  const handleSpeciesOpen = () => {
      setIsSpeciesOpen(!isSpeciesOpen);
      setIsAnimalSexOpen(false);
  };

  const handleAnimalSexOpen = () => {
      setIsAnimalSexOpen(!isAnimalSexOpen);
      setIsSpeciesOpen(false);
  };

  const handleSpeciesChange = (value) => {
    setSpeciesValue(value);
  };

  const handleAnimalSexChange = (value) => {
    setAnimalSexValue(value);
  };

  const showFinTimePicker = () => {
    setFinTimePickerVisible(true);
  };
    
  const hideFinTimePicker = () => {
    setFinTimePickerVisible(false);
  };
    
  const handleFinTimeConfirm = (time) => {
    // Directly use the Date object if that's what your component expects
    setFinSelectedTime(time);
    hideFinTimePicker();
  };
  
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  
  useEffect(() => {
    // Fetch user data (keep this as is)

    axios.get(`${apiURL}/Position`)
      .then(response => setUser(response.data))
      .catch(error => console.error('Error fetching position:', error));
    
    // Check if route.params exists before accessing its properties
    if (route.params) {
      const {
        date,
        district,
        barangay,
        purok,
        vaccinator,
        timeStart, // Adjust as needed for your time format
        ownerName,
        address,
        sex,
        contactNo
      } = route.params;

      // Print the data in the console
      console.log('Date:', date);
      console.log('District:', district);
      console.log('Barangay:', barangay);
      console.log('Purok:', purok);
      console.log('Vaccinator:', vaccinator)
      console.log('Time Started:', timeStart);
      console.log('Owner Name:', ownerName);
      console.log('Address:', address);
      console.log('Sex:', sex)
      console.log('Contact Number:', contactNo);
      console.log('Next Entry')
  }

   //Editing Version path
   // Ensure formData exists and then access its properties
   if (route.params?.formData) {
     const {
      id,
      date,
      district,
      barangay,
      purok,
      vaccinator,
      timeStart,
      ownerName,
      address,
      sex,
      contactNo
     } = route.params.formData;
 
     console.log('ID:', id);
     console.log('Date:', date);
     console.log('District:', district);
     console.log('Barangay:', barangay);
     console.log('Purok:', purok);
     console.log('Vaccinator:', vaccinator);
     console.log('Time Started:', timeStart);
     console.log('Owner Name:', ownerName);
     console.log('Address:', address);
     console.log('Sex:', sex);
     console.log('Contact Number:', contactNo);
   }

   // If editing an existing form, autofill the data
  if (route.params?.petData) {
    const petData = route.params.petData;
    const adjustedDate = new Date(petData.dateVaccinated);
    adjustedDate.setDate(adjustedDate.getDate() + 1);

    setpetName(petData.petName || '');
    setpetAge(petData.petAge || '');
    setSpeciesValue(petData.species || null);
    setAnimalSexValue(petData.petSex || null);
    setcolorMarkings(petData.color || '');
    setcardNumber(petData.cardNo || '');
    setvaccineLotNumber(petData.vaccine || '');
    setsourceOfVaccine(petData.source || '');
    setSelectedDateVac(adjustedDate);

    if (petData.timeFinish) {
      const [hours, minutes] = petData.timeFinish.split(':');
      const time = new Date();
      time.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      setFinSelectedTime(time);
    }
  }
  }, [route.params]);

  const handleSubmitPress = () => {
    // Check if all fields are filled
    if (
      petName === '' ||
      petAge === '' ||
      speciesValue === null ||
      AnimalSexValue === null ||
      colorMarkings === '' ||
      cardNumber === '' ||
      vaccineLotNumber === '' ||
      sourceOfVaccine === '' ||
      selectedDateVac === null ||
      selectedFinTime === null
    ) {
      toggleModal();
    } else {
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
      date: formData.date,
      district: formData.district,
      barangay: formData.barangay,
      purok: formData.purok,
      vaccinator:formData.vaccinator,
      timeStart: formData.timeStart,
      ownerName: formData.ownerName,
      address: formData.address,
      sex:formData.sex,
      contactNo: formData.contactNo,

      petName, 
      petAge, 
      species: speciesValue, 
      petSex: AnimalSexValue, 
      color: colorMarkings,
      cardNo: cardNumber, 
      vaccine: vaccineLotNumber, 
      source: sourceOfVaccine,
      dateVaccinated: selectedDateVac ? selectedDateVac.toISOString() : null,
      timeFinish: selectedFinTime ? selectedFinTime.toISOString() : null,
    };
  } else {
      // For new entries, use both the data from the previous screen and the current form
    submissionData = {
      date: route.params?.date,
      district: route.params?.district,
      barangay: route.params?.barangay,
      purok: route.params?.purok,
      vaccinator:route.params?.vaccinator,
      timeStart: route.params?.timeStart,
      ownerName: route.params?.ownerName,
      address: route.params?.address,
      sex:route.params?.sex,
      contactNo: route.params?.contactNo,

      petName,
      petAge,
      species: speciesValue,
      petSex: AnimalSexValue,
      color:colorMarkings,
      cardNo: cardNumber,
      vaccine: vaccineLotNumber,
      source: sourceOfVaccine,
      dateVaccinated: selectedDateVac,
      timeFinish: selectedFinTime,
    };
  }

  const endpoint = isEdit ? `${apiURL}/editVaccinationForm` : `${apiURL}/submitVaccinationForm`;

  if (isEdit) {
    // If editing, include the ID in the formData
    formData.id = route.params.formData.id;
  }

 // Perform the POST request to the server
 axios.post(endpoint, submissionData)
 .then(response => {
   if (response.data.success) {
     console.log(isEdit ? "Vaccination Form updated successfully." : "Vaccination Form submitted successfully.");
    if (isEdit) {
      setUpdateSuccessModalVisible(true); // Show update success modal for edits
    } else {
      setSuccessModalVisible(true); // Show success modal for new entries
    }
  }
 })
 .catch(error => {
   console.error('Error submitting Vaccination form:', error);
 });
};

// Function to handle navigation after form submission
const navigateAfterSubmit = () => {
  const position = user.position;
  if (isEdit) {
    // If it's an edit, navigate to Neuter_Fo_archive for both positions
    navigation.navigate('Field_vacc_archives');
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
    <View style={styles.container}>
        <Text style={styles.header}>Rabies Field Vaccination Form (Part 2)</Text>

         {/* White Container */}
      <View style={styles.whiteContainer}>
        <ScrollView
        contentContainerStyle={styles.scrollViewContainer} 
        nestedScrollEnabled={true} // Enable this on Android
        >
          <View style={styles.greenContainer}>
              <Text style={styles.greenText}>Input "N/A" if information is unavailable</Text>
          </View>
          {/* Container for animal information */}
          <View style={styles.rowContainer}>
            <Text style={styles.headerText}>Animal Information</Text>
          </View>

          {/* Container for Name and Age */}
          <View style={styles.rowContainer2}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>Name</Text>
                <TextInput
                  style={styles.textBox}
                  placeholder="Browny"
                  value={petName}
                  onChangeText={handlepetNameChange}  // Handle text changes
                  // Additional TextInput props can be added as needed
                />
              </View>

              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>Age</Text>
                <TextInput
                  style={styles.textBox}
                  placeholder="8 months Old"
                  value={petAge}
                  onChangeText={handlepetAgeChange}  // Handle text changes
                  // Additional TextInput props can be added as needed
                />
              </View>
          </View>

          {/* Container for Species and Sex */}
          <View style={styles.rowContainer2}>
              <View style={styles.dropdownContainer}>
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

              <View style={styles.dropdownContainer}>
                <Text style={styles.labelText}>Sex</Text>
                  <DropDownPicker
                    open={isAnimalSexOpen}
                    value={AnimalSexValue}
                    items={[
                      { label: 'Male', value: 'Male' },
                      { label: 'Female', value: 'Female' },
                    ]}
                    placeholder="Please select first"
                    setOpen={handleAnimalSexOpen}
                    setValue={handleAnimalSexChange}
                    listMode="SCROLLVIEW" // Ensure the internal list is a ScrollView
                  />
              </View>
          </View>

          {/* Container for Color/Markings and Card Number*/}
          <View style={styles.rowContainer2}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>Color/Markings</Text>
                <TextInput
                  style={styles.textBox}
                  placeholder="White"
                  value={colorMarkings}
                  onChangeText={handlecolorMarkingsChange}  // Handle text changes
                  // Additional TextInput props can be added as needed
                />
              </View>

              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>Card Number</Text>
                <TextInput
                  style={styles.textBox}
                  placeholder=" "
                  value={cardNumber}
                  onChangeText={handlecardNumberChange}  // Handle text changes
                  // Additional TextInput props can be added as needed
                />
              </View>
          </View>

          {/* Container for Vaccine Information */}
          <View style={styles.rowContainer2}>
            <Text style={styles.headerText}>Vaccine Information</Text>
          </View>

          {/* Container for Vaccine Used/Lot Number and Source of Vaccine */}
          <View style={styles.rowContainer2}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>Vaccine/Lot Number </Text>
                <TextInput
                  style={styles.textBox}
                  placeholder=" "
                  value={vaccineLotNumber}
                  onChangeText={handlevaccineLotNumberChange}  // Handle text changes
                  // Additional TextInput props can be added as needed
                />
              </View>

              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>Source of Vaccine </Text>
                <TextInput
                  style={styles.textBox}
                  placeholder=" "
                  value={sourceOfVaccine}
                  onChangeText={handlesourceOfVaccineChange}  // Handle text changes
                  // Additional TextInput props can be added as needed
                />
              </View>
          </View>

          {/* Container for Date Vaccinated and Time Finished */}
          <View style={styles.rowContainer2}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>Date Vaccinated </Text>
                <TouchableOpacity onPress={showDateVacPicker}>
                  <Text style={styles.textBox}>
                    {selectedDateVac ? selectedDateVac.toDateString() : 'Select Date'}
                  </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isDateVacPickerVisible}
                  mode="date"
                  onConfirm={handleDateVacConfirm}
                  onCancel={hideDateVacPicker}
                /> 
              </View>

              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>Time Finished </Text>
                <TouchableOpacity onPress={showFinTimePicker}>
                  <Text style={styles.textBox}>
                    {selectedFinTime
                      ? selectedFinTime.toLocaleTimeString()
                      : 'Select Time'}
                  </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isFinTimePickerVisible}
                  mode="time"
                  onConfirm={handleFinTimeConfirm}
                  onCancel={hideFinTimePicker}
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
                  navigation.navigate('Rabies_Field_Vacc_Form');
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
                  Please fill in all fields before submitting.
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
    
  </KeyboardAvoidingView>
  );
  
};

export default Rabies_Field_Vacc_Form2;
