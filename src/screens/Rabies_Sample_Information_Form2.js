import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import {
  AppButton,
  AppDropdown,
  AppModal,
  FormScreen,
  FormSectionLabel,
  menuStyles,
} from '../components';

const YES_NO = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

const SEXES = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

const SPECIMENS = [
  { label: 'Head', value: 'Head' },
  { label: 'Whole Carcass', value: 'Whole Carcass' },
  { label: 'Brain', value: 'Brain' },
];

const OWNERSHIP = [
  { label: 'Household Pet', value: 'Household Pet' },
  { label: 'Stray', value: 'Stray' },
];

const VACCINATED = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
  { label: 'Unknown', value: 'Unknown' },
];

const CONTACT_OPTIONS = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
  { label: 'Not sure', value: 'Not sure' },
];

const PET_MANAGEMENT = [
  { label: 'Stray', value: 'Stray' },
  { label: 'Free', value: 'Free' },
  { label: 'Leashed', value: 'Leashed' },
];

const CAUSE_OF_DEATH = [
  { label: 'Euthanasia', value: 'Euthanasia' },
  { label: 'Illness', value: 'Illness' },
  { label: 'Accident', value: 'Accident' },
  { label: 'Others', value: 'Others' },
];

const BEHAVIORAL_CHANGES = [
  { label: 'None', value: 'None' },
  { label: 'Restlessness', value: 'Restlessness' },
  { label: 'Apprehensive Watchful Look', value: 'Apprehensive Watchful Look' },
  { label: 'Unprovoked Aggressiveness', value: 'Unprovoked Aggressiveness' },
  { label: 'Aimless Running', value: 'Aimless Running' },
  { label: 'Eating Inanimate Objects', value: 'Eating Inanimate Objects' },
  { label: 'Drooling Saliva', value: 'Drooling Saliva' },
  { label: 'Paralysis', value: 'Paralysis' },
];

const OTHER_ILLNESS_SIGNS = [
  { label: 'Diarrhea', value: 'Diarrhea' },
  { label: 'Vomiting', value: 'Vomiting' },
  { label: 'Inappetence', value: 'Inappetence' },
  { label: 'Jaundice', value: 'Jaundice' },
  { label: 'Skin Lesions', value: 'Skin Lesions' },
  { label: 'Lethargy/Weakness', value: 'Lethargy/Weakness' },
  { label: 'Nasal/Ocular Discharge', value: 'Nasal/Ocular Discharge' },
  { label: 'Convulsions/Seizures', value: 'Convulsions/Seizures' },
  { label: 'Others', value: 'Others' },
];

const FAT_RESULTS = [
  { label: 'Positive', value: 'Positive' },
  { label: 'Negative', value: 'Negative' },
];

const Rabies_Sample_Information_Form2 = () => {
  const [user, setUser] = useState(null);
  const route = useRoute();

  const [specimenValue, setSpecimenValue] = useState(null);
  const [sexValue, setSexValue] = useState(null);
  const [typeofOwnershipValue, setTypeofOwnershipValue] = useState(null);
  const [dogvaccinatedValue, setDogvaccinatedValue] = useState(null);
  const [contactValue, setContactValue] = useState(null);
  const [petmanagementValue, setPetmanagementValue] = useState(null);
  const [causeValue, setCauseValue] = useState(null);
  const [changesValue, setChangesValue] = useState(null);
  const [illnessValue, setIllnessValue] = useState(null);
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

  useEffect(() => {
    axios
      .get(`${apiURL}/Position`)
      .then((response) => setUser(response.data))
      .catch((error) => console.error('Error fetching position:', error));

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
    const isEditing = Boolean(formData?.id);
    let submissionData = {};

    if (isEditing) {
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

    const endpoint = isEditing ? `${apiURL}/editRabiesSampleForms` : `${apiURL}/submitRabiesSampleForms`;

    axios
      .post(endpoint, submissionData)
      .then((response) => {
        if (response.data.success) {
          if (isEditing) {
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
    } else if (position === 'CVO' || position === 'RabDash') {
      navigation.navigate('VetInputForms');
    } else if (position === 'Private Veterinarian') {
      navigation.navigate('InputForms');
    } else {
      console.warn('Unknown user position:', position);
    }
  };

  return (
    <FormScreen title="Rabies Sample Information (Part 2)">
      <FormSectionLabel title="Sample Details" first />
      <View style={menuStyles.row}>
        <AppDropdown
          label="Sex"
          open={activeDropdown === 'sex'}
          value={sexValue}
          items={SEXES}
          setOpen={() => handleDropdownOpen('sex')}
          setValue={setSexValue}
          placeholder="Select sex"
        />
        <AppDropdown
          label="Specimen"
          open={activeDropdown === 'specimen'}
          value={specimenValue}
          items={SPECIMENS}
          setOpen={() => handleDropdownOpen('specimen')}
          setValue={setSpecimenValue}
          placeholder="Select specimen"
        />
      </View>
      <AppDropdown
        label="Type of Ownership"
        open={activeDropdown === 'typeofOwnership'}
        value={typeofOwnershipValue}
        items={OWNERSHIP}
        setOpen={() => handleDropdownOpen('typeofOwnership')}
        setValue={setTypeofOwnershipValue}
        placeholder="Select ownership type"
      />

      <FormSectionLabel title="Health History" />
      <AppDropdown
        label="Dog Vaccinated"
        open={activeDropdown === 'dogvaccinated'}
        value={dogvaccinatedValue}
        items={VACCINATED}
        setOpen={() => handleDropdownOpen('dogvaccinated')}
        setValue={setDogvaccinatedValue}
        placeholder="Select status"
      />
      <AppDropdown
        label="Pos. contact with oth. animals"
        open={activeDropdown === 'contact'}
        value={contactValue}
        items={CONTACT_OPTIONS}
        setOpen={() => handleDropdownOpen('contact')}
        setValue={setContactValue}
        placeholder="Select answer"
      />
      <AppDropdown
        label="Pet Management"
        open={activeDropdown === 'petmanagement'}
        value={petmanagementValue}
        items={PET_MANAGEMENT}
        setOpen={() => handleDropdownOpen('petmanagement')}
        setValue={setPetmanagementValue}
        placeholder="Select management"
      />
      <AppDropdown
        label="Caused of Death"
        open={activeDropdown === 'cause'}
        value={causeValue}
        items={CAUSE_OF_DEATH}
        setOpen={() => handleDropdownOpen('cause')}
        setValue={setCauseValue}
        placeholder="Select cause"
      />
      <AppDropdown
        label="Behavioral Changes"
        open={activeDropdown === 'changes'}
        value={changesValue}
        items={BEHAVIORAL_CHANGES}
        setOpen={() => handleDropdownOpen('changes')}
        setValue={setChangesValue}
        placeholder="Select behavior"
        maxHeight={500}
        dropDownDirection="AUTO"
        scrollViewProps={{ nestedScrollEnabled: true }}
      />
      <AppDropdown
        label="Other Signs of Illness"
        open={activeDropdown === 'illness'}
        value={illnessValue}
        items={OTHER_ILLNESS_SIGNS}
        setOpen={() => handleDropdownOpen('illness')}
        setValue={setIllnessValue}
        placeholder="Select sign"
        maxHeight={200}
        dropDownDirection="AUTO"
        scrollViewProps={{ nestedScrollEnabled: true }}
      />

      <FormSectionLabel title="Lab Result" />
      <AppDropdown
        label="FAT Result"
        open={activeDropdown === 'FAT'}
        value={FATValue}
        items={FAT_RESULTS}
        setOpen={() => handleDropdownOpen('FAT')}
        setValue={setFATValue}
        placeholder="Select result"
      />

      <View style={menuStyles.formActionsRow}>
        <AppButton title="Back" variant="secondary" onPress={() => navigation.navigate('Rabies_Sample_Information_Form')} style={menuStyles.rowButton} />
        <AppButton title="Submit" variant="primary" onPress={handleSubmitPress} style={menuStyles.rowButton} />
      </View>

      <AppModal
        isVisible={isModalVisible}
        message="Please fill in all fields before proceeding."
        onBackdropPress={toggleModal}
        actions={[{ label: 'OK', onPress: toggleModal }]}
      />

      <AppModal
        isVisible={isConfirmModalVisible}
        message="Are you sure of your answers?"
        onBackdropPress={toggleConfirmModal}
        actions={[
          { label: 'No', variant: 'secondary', onPress: toggleConfirmModal },
          {
            label: 'Yes',
            onPress: () => {
              toggleConfirmModal();
              submitForm();
            },
          },
        ]}
      />

      <AppModal
        isVisible={isSuccessModalVisible}
        message="Form submitted successfully!"
        onBackdropPress={() => {
          setSuccessModalVisible(false);
          navigateAfterSubmit();
        }}
        actions={[
          {
            label: 'OK',
            onPress: () => {
              setSuccessModalVisible(false);
              navigateAfterSubmit();
            },
          },
        ]}
      />

      <AppModal
        isVisible={isUpdateSuccessModalVisible}
        message="Form updated successfully!"
        onBackdropPress={() => {
          setUpdateSuccessModalVisible(false);
          navigateAfterSubmit();
        }}
        actions={[
          {
            label: 'OK',
            onPress: () => {
              setUpdateSuccessModalVisible(false);
              navigateAfterSubmit();
            },
          },
        ]}
      />
    </FormScreen>
  );
};

export default Rabies_Sample_Information_Form2;
