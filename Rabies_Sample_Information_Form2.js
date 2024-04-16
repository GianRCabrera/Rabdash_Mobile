import React, { useState, useEffect } from 'react';
import { 
  View,
  Text,
  TextInput,
  TouchableOpacity 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker'; // Add this import
import Modal from 'react-native-modal';
import axios from 'axios';
import styles from './styles/submitform';

const Rabies_Sample_Information_Form2 = () => {
  
  const [user, setUser] = useState(null);
  const route = useRoute();

  const [isSpecimenOpen, setIsSpecimenOpen] = useState(false);
  const [specimenValue, setSpecimenValue] = useState(null);

  const [isSexOpen, setIsSexOpen] = useState(false);
  const [sexValue, setSexValue] = useState(null);

    const [isTypeofOwnershipOpen, setIsTypeofOwnershipOpen] = useState(false);
    const [typeofOwnershipValue, setTypeofOwnershipValue] = useState(null);

    const [isDogvaccinatedOpen, setIsDogvaccinatedOpen] = useState(false);
    const [dogvaccinatedValue, setDogvaccinatedValue] = useState(null);

    const [isContactOpen, setIsContactOpen] = useState(false);
    const [contactValue, setContactValue] = useState(null);

    const [isPetmanagementOpen, setIsPetmanagementOpen] = useState(false);
    const [petmanagementValue, setPetmanagementValue] = useState(null);

    const [isCauseOpen, setIsCauseOpen] = useState(false);
    const [causeValue, setCauseValue] = useState(null);

    const [isChangesOpen, setIsChangesOpen] = useState(false);
    const [changesValue, setChangesValue] = useState(null);

    const [isIllnessOpen, setIsIllnessOpen] = useState(false);
    const [illnessValue, setIllnessValue] = useState(null);

    const [isFATOpen, setIsFATOpen] = useState(false);
    const [FATValue, setFATValue] = useState(null);

    const navigation = useNavigation();
    const apiURL = process.env.EXPO_PUBLIC_URL;

    const [isModalVisible, setModalVisible] = useState(false);
    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
    const [isUpdateSuccessModalVisible, setUpdateSuccessModalVisible] = useState(false);
    
    const isEdit = route.params?.formData?.id ? true : false;

    const [sexZIndex, setSexZIndex] = useState(1); 
    const [specimenZIndex, setSpecimenZIndex] = useState(1); // zIndex state for specimen dropdown
    const [typofOwnershipZIndex, setTypeofOwnershipZIndex] = useState(1); 
    const [dogvaccinatedZIndex, setDogvaccinatedZIndex] = useState(1); 
    const [contactZIndex, setContactZIndex] = useState(1); 
    const [petmanagementZIndex, setPetmanagementZIndex] = useState(1); 
    const [causeZIndex, setCauseZIndex] = useState(1); 
    const [changesZIndex, setChangesZIndex] = useState(1); 
    const [illnessZIndex, setIllnessZIndex] = useState(1); 
    const [FATZIndex, setFATZIndex] = useState(1); 

    const toggleConfirmModal = () => {
      setConfirmModalVisible(!isConfirmModalVisible);
    };

    const toggleModal = () => {
      setModalVisible(!isModalVisible);
    };

    const handleSexOpen = () => {
        setIsSexOpen(!isSexOpen);
        setIsSpecimenOpen(false);
        setIsTypeofOwnershipOpen(false);
        setIsDogvaccinatedOpen(false);
        setIsContactOpen(false);
        setIsPetmanagementOpen(false);
        setIsCauseOpen(false);
        setIsChangesOpen(false);
        setIsIllnessOpen(false);
        setIsFATOpen(false);
        
        //ZIndex
        setSexZIndex(isSexOpen ? 1 : 10);

    };
    
    const handleSpecimenOpen = () => {
        setIsSpecimenOpen(!isSpecimenOpen);
        setIsSexOpen(false);
        setIsTypeofOwnershipOpen(false);
        setIsDogvaccinatedOpen(false);
        setIsContactOpen(false);
        setIsPetmanagementOpen(false);
        setIsCauseOpen(false);
        setIsChangesOpen(false);
        setIsIllnessOpen(false);
        setIsFATOpen(false);

      // Update zIndex for specimen dropdown
      setSpecimenZIndex(isSpecimenOpen ? 2 : 10);
    };
    
    const handleTypeofOwnershipOpen = () => {
        setIsTypeofOwnershipOpen(!isTypeofOwnershipOpen);
        setIsSexOpen(false);
        setIsSpecimenOpen(false);
        setIsDogvaccinatedOpen(false);
        setIsContactOpen(false);
        setIsPetmanagementOpen(false);
        setIsCauseOpen(false);
        setIsChangesOpen(false);
        setIsIllnessOpen(false);
        setIsFATOpen(false);

        setTypeofOwnershipZIndex(isTypeofOwnershipOpen ? 3 : 10);

    };
    
    const handleDogvaccinatedOpen = () => {
        setIsDogvaccinatedOpen(!isDogvaccinatedOpen);
        setIsSexOpen(false);
        setIsSpecimenOpen(false);
        setIsTypeofOwnershipOpen(false);
        setIsContactOpen(false);
        setIsPetmanagementOpen(false);
        setIsCauseOpen(false);
        setIsChangesOpen(false);
        setIsIllnessOpen(false);
        setIsFATOpen(false);

        setDogvaccinatedZIndex(isDogvaccinatedOpen ? 4 : 10);

    };
    
    const handleContactOpen = () => {
        setIsContactOpen(!isContactOpen);
        setIsSexOpen(false);
        setIsSpecimenOpen(false);
        setIsTypeofOwnershipOpen(false);
        setIsDogvaccinatedOpen(false);
        setIsPetmanagementOpen(false);
        setIsCauseOpen(false);
        setIsChangesOpen(false);
        setIsIllnessOpen(false);
        setIsFATOpen(false);

        setContactZIndex(isContactOpen ? 5 : 10);

    };
    
    const handlePetmanagementOpen = () => {
        setIsPetmanagementOpen(!isPetmanagementOpen);
        setIsSexOpen(false);
        setIsSpecimenOpen(false);
        setIsTypeofOwnershipOpen(false);
        setIsDogvaccinatedOpen(false);
        setIsContactOpen(false);
        setIsCauseOpen(false);
        setIsChangesOpen(false);
        setIsIllnessOpen(false);
        setIsFATOpen(false);

        setPetmanagementZIndex(isPetmanagementOpen ? 6 : 10);

    };   
    
    const handleCauseOpen = () => {
        setIsCauseOpen(!isCauseOpen);
        setIsSexOpen(false);
        setIsSpecimenOpen(false);
        setIsTypeofOwnershipOpen(false);
        setIsDogvaccinatedOpen(false);
        setIsContactOpen(false);
        setIsPetmanagementOpen(false);
        setIsChangesOpen(false);
        setIsIllnessOpen(false);
        setIsFATOpen(false);

        setCauseZIndex(isCauseOpen ? 7 : 10);

    };    

    const handleChangesOpen = () => {
        setIsChangesOpen(!isChangesOpen);
        setIsSexOpen(false);
        setIsSpecimenOpen(false);
        setIsTypeofOwnershipOpen(false);
        setIsDogvaccinatedOpen(false);
        setIsContactOpen(false);
        setIsPetmanagementOpen(false);
        setIsCauseOpen(false);
        setIsIllnessOpen(false);
        setIsFATOpen(false);

        setChangesZIndex(isChangesOpen ? 8 : 10);

    };

    const handleIllnessOpen = () => {
        setIsIllnessOpen(!isIllnessOpen);
        setIsSexOpen(false);
        setIsSpecimenOpen(false);
        setIsTypeofOwnershipOpen(false);
        setIsDogvaccinatedOpen(false);
        setIsContactOpen(false);
        setIsPetmanagementOpen(false);
        setIsCauseOpen(false);
        setIsChangesOpen(false);
        setIsFATOpen(false);

        setIllnessZIndex(isIllnessOpen ? 9 : 10);

    };

    const handleFATOpen = () => {
        setIsFATOpen(!isFATOpen);
        setIsSexOpen(false);
        setIsSpecimenOpen(false);
        setIsTypeofOwnershipOpen(false);
        setIsDogvaccinatedOpen(false);
        setIsContactOpen(false);
        setIsPetmanagementOpen(false);
        setIsCauseOpen(false);
        setIsChangesOpen(false)
        setIsIllnessOpen(false);

        setFATZIndex(isFATOpen ? 10 : 10);

    };

    const handleSexChange = (value) => {
      setSexValue(value);
    };

    const handleSpecimenChange = (value) => {
        setSpecimenValue(value);
    };

    const handleTypeofOwnershipChange = (value) => {
      setTypeofOwnershipValue(value);
   };

   const handleDogvaccinatedChange = (value) => {
      setDogvaccinatedValue(value);
   };

   const handleContactChange = (value) => {
    setContactValue(value);
    };

    const handlePetmanagementChange = (value) => {
        setPetmanagementValue(value);
    };

    const handleCauseChange = (value) => {
        setCauseValue(value);
    };

    const handleChangesChange = (value) => {
        setChangesValue(value);
    };

    const handleIllnessChange = (value) => {
        setIllnessValue(value);
    };

    const handleFATChange = (value) => {
        setFATValue(value);
    };


  useEffect(() => {
    // Fetch user data (keep this as is)
    //const NETWORK_URL1 = 'http://192.168.1.7:3000/Position';
    //const NETWORK_URL1 = 'http://192.168.1.7:3000/Position';

    axios.get(`${apiURL}/Position`)
      .then(response => setUser(response.data))
      .catch(error => console.error('Error fetching position:', error));

    // Check if route.params exists before accessing its properties
    if (route.params) {
      const {
       name,
       sex,
       address,
       number,
       district,
       barangay,
       date,
       species,
       breed,
       age
      } = route.params;

      // Print the data in the console
      console.log('Name:', name);
      console.log('Sex:', sex);
      console.log('Address:', address)
      console.log('Contact Number:', number)
      console.log('District:', district)
      console.log('Barangay:', barangay);
      console.log('Date:', date);
      console.log('Species:', species);
      console.log('Breed:', breed);
      console.log('Age:', age);
      console.log('Next Entry')
    }

    //Editing Version path
    // Ensure formData exists and then access its properties
    if (route.params?.formData) {
      const {
       id,
       name,
       sex,
       address,
       number,
       district,
       barangay,
       date,
       species,
       breed,
       age
      } = route.params.formData;
  
      console.log('Name:', name);
      console.log('Sex:', sex);
      console.log('Address:', address)
      console.log('Contact Number:', number)
      console.log('District:', district)
      console.log('Barangay:', barangay);
      console.log('Date:', date);
      console.log('Species:', species);
      console.log('Breed:', breed);
      console.log('Age:', age);
    }
    // Ensure autofill functionality
    const { petData } = route.params || {};

    if (petData) {
      setSexValue(petData.sampleSex || null);
      setSpecimenValue(petData.specimen || null);
      setTypeofOwnershipValue(petData.ownership || null);
      setDogvaccinatedValue(petData.vacStatus || null);
      setContactValue(petData.contact || null);
      setPetmanagementValue(petData.manage || null);
      setCauseValue(petData.death || null);
      setChangesValue(petData.changes || null);
      setIllnessValue(petData.otherillness || null);
      setFATValue(petData.fatcount || null);
    }
  }, [route.params]); // Run this effect whenever route.params changes

  const handleSubmitPress = () => {
    // Check if all fields are filled
   if (
    sexValue === '' ||
    specimenValue=== null ||
    typeofOwnershipValue === null ||
    dogvaccinatedValue === null ||
    contactValue === null ||
    petmanagementValue === null ||
    causeValue === null ||
    changesValue === null ||
    illnessValue === null ||
    FATValue === null 
   ) {
     toggleModal();
   } else {
      // ... (existing code)
      toggleConfirmModal();
   }
 };

 const submitForm = () => {
  // Extract initial data passed to Sample_Information_Form2
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
      name: formData.name,
      sex: formData.sex,
      address: formData.address,
      number: formData.number,
      district: formData.district,
      barangay: formData.barangay,
      date: formData.date,
      species: formData.species,
      breed: formData.breed,
      age: formData.age,

      sampleSex: sexValue,
      specimen: specimenValue,
      ownership: typeofOwnershipValue,
      vacStatus: dogvaccinatedValue,
      contact: contactValue,
      manage: petmanagementValue,
      death: causeValue,
      changes: changesValue,
      otherillness: illnessValue,
      fatcount: FATValue, 
    };
  } else{
    // For new entries, use both the data from the previous screen and the current form
    submissionData = {
      name: route.params?.name,
      sex: route.params?.sex,
      address: route.params?.address,
      number: route.params?.number,
      district: route.params?.district,
      barangay: route.params?.barangay,
      date: route.params?.date,
      species: route.params?.species,
      breed: route.params?.breed,
      age: route.params?.age,

      sampleSex: sexValue,
      specimen: specimenValue,
      ownership: typeofOwnershipValue,
      vacStatus: dogvaccinatedValue,
      contact: contactValue,
      manage: petmanagementValue,
      death: causeValue,
      changes: changesValue,
      otherillness: illnessValue,
      fatcount: FATValue,
    };
  }

  const endpoint = isEdit ? `${apiURL}/editRabiesSampleForms` : `${apiURL}/submitRabiesSampleForms`;

  if (isEdit) {
    // If editing, include the ID in the formData
    formData.id = route.params.formData.id;
  }

  // Perform the POST request to the server
 axios.post(endpoint, submissionData)
 .then(response => {
   if (response.data.success) {
     console.log(isEdit ? "Rabies Sample Form updated successfully." : "Rabies Sample Form submitted successfully.");
     if (isEdit) {
      setUpdateSuccessModalVisible(true); // Show update success modal for edits
    } else {
      setSuccessModalVisible(true); // Show success modal for new entries
    }
   }
 })
 .catch(error => {
   console.error('Error submitting Rabies Sample form:', error);
 });
};

// Function to handle navigation after form submission
const navigateAfterSubmit = () => {
  const position = user.position;
  if (isEdit) {
    // If it's an edit, navigate to Neuter_Fo_archive for both positions
    navigation.navigate('Sample_form_archive');
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
      <Text style={styles.headerText}>Rabies Sample Information Form (Part 2)</Text>

       {/* White Container */}
    <View style={styles.whiteContainer}>
      <View style={styles.greenContainer}>
          <Text style={styles.greenText}>Input "N/A" if information is unavailable</Text>
      </View>

      {/* Container for Sex and Specimen */}
      <View style={styles.rowContainer}>
          <View style={[styles.dropdownContainer, {zIndex: sexZIndex}]}>
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
                />
          </View>

          <View style={[styles.dropdownContainer, {zIndex: specimenZIndex}]}>
                <Text style={styles.labelText}>Specimen</Text>
                <DropDownPicker
                open={isSpecimenOpen}
                value={specimenValue}
                items={[
                    { label: 'Head', value: 'Head' },
                    { label: 'Whole Carcass', value: 'Whole Carcass' },
                    { label: 'Brain', value: 'Brain' },
                ]}
                placeholder="Please select first"
                setOpen={handleSpecimenOpen}
                setValue={handleSpecimenChange}
                />
             </View>
      </View>

      {/* Container for Type of Ownership and Dog Vaccinated */}
      <View style={styles.rowContainer2}>
        <View style={[styles.dropdownContainer, {zIndex: typofOwnershipZIndex}]}>
              <Text style={styles.labelText}>Type of Ownership</Text>
              <DropDownPicker
                open={isTypeofOwnershipOpen}
                value={typeofOwnershipValue}
                items={[
                    { label: 'Household Pet', value: 'Household Pet' },
                    { label: 'Stray', value: 'Stray' },
                ]}
                placeholder="Please select first"
                setOpen={handleTypeofOwnershipOpen}
                setValue={handleTypeofOwnershipChange}
                />
          </View>

          <View style={[styles.dropdownContainer, {zIndex: dogvaccinatedZIndex}]}>
              <Text style={styles.labelText}>Dog Vaccinated</Text>
              <DropDownPicker
                open={isDogvaccinatedOpen}
                value={dogvaccinatedValue}
                items={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                    { label: 'Unknown', value: 'Unknown' },
                ]}
                placeholder="Please select first"
                setOpen={handleDogvaccinatedOpen}
                setValue={handleDogvaccinatedChange}
                />
          </View>
      </View>

      {/* Container for District and Barangay*/}
      <View style={styles.rowContainer2}>
           {/* Contact Container */}
           <View style={[styles.dropdownContainer, {zIndex: contactZIndex}]}>
              <Text style={styles.labelText}>Pos. contact with oth. animals</Text>
              <DropDownPicker
                open={isContactOpen}
                value={contactValue}
                items={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                    { label: 'Not sure', value: 'Not sure' },
                ]}
                placeholder="Please select first"
                setOpen={handleContactOpen}
                setValue={handleContactChange}
                />
          </View>

          <View style={[styles.dropdownContainer, {zIndex: petmanagementZIndex}]}>
              <Text style={styles.labelText}>Pet Management</Text>
              <DropDownPicker
                open={isPetmanagementOpen}
                value={petmanagementValue}
                items={[
                    { label: 'Stray', value: 'Stray' },
                    { label: 'Free', value: 'Free' },
                    { label: 'Leashed', value: 'Leashed' },
                ]}
                placeholder="Please select first"
                setOpen={handlePetmanagementOpen}
                setValue={handlePetmanagementChange}
                />
          </View>
      </View>

      {/* Container for Caused of Death and Behavioral Changes */}
      <View style={styles.rowContainer2}>
      <View style={[styles.dropdownContainer, {zIndex: causeZIndex}]}>
            <Text style={styles.labelText}>Caused of Death</Text>
            <DropDownPicker
                open={isCauseOpen}
                value={causeValue}
                items={[
                    { label: 'Euthanesia', value: 'Euthanasia' },
                    { label: 'Illness', value: 'Illness' },
                    { label: 'Accident', value: 'Accident' },
                    { label: 'Others', value: 'Others' },
                ]}
                placeholder="Please select first"
                setOpen={handleCauseOpen}
                setValue={handleCauseChange}
            />
        </View>

        <View style={[styles.dropdownContainer, {zIndex:changesZIndex }]}>
            <Text style={styles.labelText}>Behavioral Changes</Text>
            <DropDownPicker
                open={isChangesOpen}
                value={changesValue}
                items={[
                    { label: 'None', value: 'None' },
                    { label: 'Restlessness', value: 'Restlessness' },
                    { label: 'Apprehensive Watchful Look', value: 'Apprehensive Watchful Look' },
                    { label: 'Unprovoked Aggressiveness', value: 'Unprovoked Aggressiveness' },
                    { label: 'Aimless Running', value: 'Aimless Running' },
                    { label: 'Eating Inanimate Objects', value: 'Eating Inanimate Objects' },
                    { label: 'Drooling Saliva', value: 'Drooling Saliva' },
                    { label: 'Paralysis', value: 'Paralysis' },
                ]}
                placeholder="Please select first"
                setOpen={handleChangesOpen}
                setValue={handleChangesChange}
            />
        </View>
      </View>

      {/* Container for Other Signs of Illness and FAT Result */}
      <View style={styles.rowContainer2}>
        <View style={[styles.dropdownContainer, {zIndex: illnessZIndex}]}>
            <Text style={styles.labelText}>Other Signs of Illness:</Text>
            <DropDownPicker
                open={isIllnessOpen}
                value={illnessValue}
                items={[
                    { label: 'Diarrhea', value: 'Diarrhea' },
                    { label: 'Vomiting', value: 'Vomiting' },
                    { label: 'Inappetence', value: 'Inappetence' },
                    { label: 'Jaundice', value: 'Jaundice' },
                    { label: 'Skin Lesions', value: 'Skin Lesions' },
                    { label: 'Lethargy/Weakness', value: 'Lethargy/Weakness' },
                    { label: 'Nasal/Ocular Discharge', value: 'Nasal/Ocular Discharge' },
                    { label: 'Convulsions/Seizures', value: 'Convulsions/Seizures' },
                    { label: 'Others', value: 'Others' },
                ]}
                placeholder="Please select first"
                setOpen={handleIllnessOpen}
                setValue={handleIllnessChange}
            />
        </View>

        <View style={[styles.dropdownContainer, {zIndex: FATZIndex}]}>
            <Text style={styles.labelText}>FAT Result</Text>
            <DropDownPicker
                open={isFATOpen}
                value={FATValue}
                items={[
                    { label: 'Positive', value: 'Positive' },
                    { label: 'Negative', value: 'Negative' },
                ]}
                placeholder="Please select first"
                setOpen={handleFATOpen}
                setValue={handleFATChange}
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
              navigation.navigate('Rabies_Sample_Information_Form');
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
    </View>
  </View>
      );
};

export default Rabies_Sample_Information_Form2; 