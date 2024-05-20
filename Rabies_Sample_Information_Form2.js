import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
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

  const [activeDropdown, setActiveDropdown] = useState(null);

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isUpdateSuccessModalVisible, setUpdateSuccessModalVisible] = useState(false);

  const isEdit = route.params?.formData?.id ? true : false;

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleDropdownOpen = (dropdownName) => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const handleSexOpen = () => handleDropdownOpen('sex');
  const handleSpecimenOpen = () => handleDropdownOpen('specimen');
  const handleTypeofOwnershipOpen = () => handleDropdownOpen('typeofOwnership');
  const handleDogvaccinatedOpen = () => handleDropdownOpen('dogvaccinated');
  const handleContactOpen = () => handleDropdownOpen('contact');
  const handlePetmanagementOpen = () => handleDropdownOpen('petmanagement');
  const handleCauseOpen = () => handleDropdownOpen('cause');
  const handleChangesOpen = () => handleDropdownOpen('changes');
  const handleIllnessOpen = () => handleDropdownOpen('illness');
  const handleFATOpen = () => handleDropdownOpen('FAT');

  const handleSexChange = (value) => setSexValue(value);
  const handleSpecimenChange = (value) => setSpecimenValue(value);
  const handleTypeofOwnershipChange = (value) => setTypeofOwnershipValue(value);
  const handleDogvaccinatedChange = (value) => setDogvaccinatedValue(value);
  const handleContactChange = (value) => setContactValue(value);
  const handlePetmanagementChange = (value) => setPetmanagementValue(value);
  const handleCauseChange = (value) => setCauseValue(value);
  const handleChangesChange = (value) => setChangesValue(value);
  const handleIllnessChange = (value) => setIllnessValue(value);
  const handleFATChange = (value) => setFATValue(value);

  useEffect(() => {
    axios
      .get(`${apiURL}/Position`)
      .then((response) => setUser(response.data))
      .catch((error) => console.error('Error fetching position:', error));

    if (route.params) {
      const { name, sex, address, number, district, barangay, date, species, breed, age } = route.params;
      console.log('Name:', name);
      console.log('Sex:', sex);
      console.log('Address:', address);
      console.log('Contact Number:', number);
      console.log('District:', district);
      console.log('Barangay:', barangay);
      console.log('Date:', date);
      console.log('Species:', species);
      console.log('Breed:', breed);
      console.log('Age:', age);
    }

    if (route.params?.formData) {
      const { id, name, sex, address, number, district, barangay, date, species, breed, age } = route.params.formData;
      console.log('Name:', name);
      console.log('Sex:', sex);
      console.log('Address:', address);
      console.log('Contact Number:', number);
      console.log('District:', district);
      console.log('Barangay:', barangay);
      console.log('Date:', date);
      console.log('Species:', species);
      console.log('Breed:', breed);
      console.log('Age:', age);
    }

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
  }, [route.params]);

  const handleSubmitPress = () => {
    if (
      sexValue === '' ||
      specimenValue === null ||
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
      toggleConfirmModal();
    }
  };

  const submitForm = () => {
    const formData = route.params?.formData || {};
    const isEdit = Boolean(formData?.id);
    let submissionData = {};

    if (isEdit) {
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
    } else {
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
      formData.id = route.params.formData.id;
    }

    axios
      .post(endpoint, submissionData)
      .then((response) => {
        if (response.data.success) {
          console.log(isEdit ? 'Rabies Sample Form updated successfully.' : 'Rabies Sample Form submitted successfully.');
          if (isEdit) {
            setUpdateSuccessModalVisible(true);
          } else {
            setSuccessModalVisible(true);
          }
        }
      })
      .catch((error) => {
        console.error('Error submitting Rabies Sample form:', error);
      });
  };

  const navigateAfterSubmit = () => {
    const position = user?.position;
    if (isEdit) {
      navigation.navigate('Sample_form_archive');
    } else {
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
      <View style={styles.headerContaineranimal}>
        <Text style={styles.header}>Rabies Sample Information (Part 2)</Text>
      </View>
      <View style={styles.whiteContainer}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer} nestedScrollEnabled={true}>
          <View style={styles.greenContainer}>
            <Text style={styles.greenText}>Input "N/A" if information is unavailable</Text>
          </View>
          <View style={styles.rowContainer}>
            <View style={[styles.dropdownContainer, { zIndex: activeDropdown === 'sex' ? 10 : 1 }]}>
              <Text style={styles.labelText}>Sex</Text>
              <DropDownPicker
                open={activeDropdown === 'sex'}
                value={sexValue}
                items={[
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                ]}
                placeholder="Please select first"
                setOpen={handleSexOpen}
                setValue={handleSexChange}
                listMode="SCROLLVIEW"
              />
            </View>
            <View style={[styles.dropdownContainer, { zIndex: activeDropdown === 'specimen' ? 10 : 1 }]}>
              <Text style={styles.labelText}>Specimen</Text>
              <DropDownPicker
                open={activeDropdown === 'specimen'}
                value={specimenValue}
                items={[
                  { label: 'Head', value: 'Head' },
                  { label: 'Whole Carcass', value: 'Whole Carcass' },
                  { label: 'Brain', value: 'Brain' },
                ]}
                placeholder="Please select first"
                setOpen={handleSpecimenOpen}
                setValue={handleSpecimenChange}
                listMode="SCROLLVIEW"
              />
            </View>
          </View>
          <View style={styles.rowContainer2}>
            <View style={[styles.dropdownContainer, { zIndex: activeDropdown === 'typeofOwnership' ? 10 : 1 }]}>
              <Text style={styles.labelText}>Type of Ownership</Text>
              <DropDownPicker
                open={activeDropdown === 'typeofOwnership'}
                value={typeofOwnershipValue}
                items={[
                  { label: 'Household Pet', value: 'Household Pet' },
                  { label: 'Stray', value: 'Stray' },
                ]}
                placeholder="Please select first"
                setOpen={handleTypeofOwnershipOpen}
                setValue={handleTypeofOwnershipChange}
                listMode="SCROLLVIEW"
              />
            </View>
            <View style={[styles.dropdownContainer, { zIndex: activeDropdown === 'dogvaccinated' ? 10 : 1 }]}>
              <Text style={styles.labelText}>Dog Vaccinated</Text>
              <DropDownPicker
                open={activeDropdown === 'dogvaccinated'}
                value={dogvaccinatedValue}
                items={[
                  { label: 'Yes', value: 'Yes' },
                  { label: 'No', value: 'No' },
                  { label: 'Unknown', value: 'Unknown' },
                ]}
                placeholder="Please select first"
                setOpen={handleDogvaccinatedOpen}
                setValue={handleDogvaccinatedChange}
                listMode="SCROLLVIEW"
              />
            </View>
          </View>
          <View style={styles.rowContainer2}>
            <View style={[styles.dropdownContainer, { zIndex: activeDropdown === 'contact' ? 10 : 1 }]}>
              <Text style={styles.labelText}>Pos. contact with oth. animals</Text>
              <DropDownPicker
                open={activeDropdown === 'contact'}
                value={contactValue}
                items={[
                  { label: 'Yes', value: 'Yes' },
                  { label: 'No', value: 'No' },
                  { label: 'Not sure', value: 'Not sure' },
                ]}
                placeholder="Please select first"
                setOpen={handleContactOpen}
                setValue={handleContactChange}
                listMode="SCROLLVIEW"
              />
            </View>
            <View style={[styles.dropdownContainer, { zIndex: activeDropdown === 'petmanagement' ? 10 : 1 }]}>
              <Text style={styles.labelText}>Pet Management</Text>
              <DropDownPicker
                open={activeDropdown === 'petmanagement'}
                value={petmanagementValue}
                items={[
                  { label: 'Stray', value: 'Stray' },
                  { label: 'Free', value: 'Free' },
                  { label: 'Leashed', value: 'Leashed' },
                ]}
                placeholder="Please select first"
                setOpen={handlePetmanagementOpen}
                setValue={handlePetmanagementChange}
                listMode="SCROLLVIEW"
              />
            </View>
          </View>
          <View style={styles.rowContainer2}>
            <View style={[styles.dropdownContainer, { zIndex: activeDropdown === 'cause' ? 10 : 1 }]}>
              <Text style={styles.labelText}>Caused of Death</Text>
              <DropDownPicker
                open={activeDropdown === 'cause'}
                value={causeValue}
                items={[
                  { label: 'Euthanasia', value: 'Euthanasia' },
                  { label: 'Illness', value: 'Illness' },
                  { label: 'Accident', value: 'Accident' },
                  { label: 'Others', value: 'Others' },
                ]}
                placeholder="Please select first"
                setOpen={handleCauseOpen}
                setValue={handleCauseChange}
                listMode="SCROLLVIEW"
              />
            </View>
            <View style={[styles.dropdownContainer, { zIndex: activeDropdown === 'changes' ? 10 : 1 }]}>
              <Text style={styles.labelText}>Behavioral Changes</Text>
              <DropDownPicker
                open={activeDropdown === 'changes'}
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
                listMode="MODAL"
                maxHeight={200}
                dropDownDirection="AUTO"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
              />
            </View>
          </View>
          <View style={styles.rowContainer2}>
            <View style={[styles.dropdownContainer, { zIndex: activeDropdown === 'illness' ? 10 : 1 }]}>
              <Text style={styles.labelText}>Other Signs of Illness:</Text>
              <DropDownPicker
                open={activeDropdown === 'illness'}
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
                listMode="SCROLLVIEW"
                maxHeight={200}
                dropDownDirection="AUTO"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
              />
            </View>
            <View style={[styles.dropdownContainer, { zIndex: activeDropdown === 'FAT' ? 10 : 1 }]}>
              <Text style={styles.labelText}>FAT Result</Text>
              <DropDownPicker
                open={activeDropdown === 'FAT'}
                value={FATValue}
                items={[
                  { label: 'Positive', value: 'Positive' },
                  { label: 'Negative', value: 'Negative' },
                ]}
                placeholder="Please select first"
                setOpen={handleFATOpen}
                setValue={handleFATChange}
                listMode="SCROLLVIEW"
              />
            </View>
          </View>
          <View style={styles.rowContainer2}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Rabies_Sample_Information_Form')}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSubmitPress}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
          <Modal isVisible={isModalVisible}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Please fill in all fields before proceeding.</Text>
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
                    toggleConfirmModal();
                    submitForm();
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
          <Modal isVisible={isSuccessModalVisible}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Form submitted successfully!</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setSuccessModalVisible(false);
                  navigateAfterSubmit();
                }}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Modal isVisible={isUpdateSuccessModalVisible}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Form updated successfully!</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setUpdateSuccessModalVisible(false);
                  navigateAfterSubmit();
                }}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </View>
  );
};

export default Rabies_Sample_Information_Form2;
