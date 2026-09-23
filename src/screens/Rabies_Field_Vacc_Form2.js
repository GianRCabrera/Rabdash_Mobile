import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import {
  AppButton,
  AppInput,
  AppDateField,
  AppDropdown,
  AppModal,
  FormScreen,
  FormSectionLabel,
  menuStyles,
} from '../components';

const SPECIES = [
  { label: 'Canine', value: 'Canine' },
  { label: 'Feline', value: 'Feline' },
];

const SEXES = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

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

  const showDateVacPicker = () => setDateVacPickerVisibility(true);
  const hideDateVacPicker = () => setDateVacPickerVisibility(false);

  const handleDateVacConfirm = (date) => {
    hideDateVacPicker();
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

  const showFinTimePicker = () => setFinTimePickerVisible(true);
  const hideFinTimePicker = () => setFinTimePickerVisible(false);

  const handleFinTimeConfirm = (time) => {
    setFinSelectedTime(time);
    hideFinTimePicker();
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    axios.get(`${apiURL}/Position`)
      .then(response => setUser(response.data))
      .catch(error => console.error('Error fetching position:', error));

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
    const formData = route.params?.formData || {};
    const isEditing = Boolean(formData?.id);

    let submissionData = {};

    if (isEditing) {
      submissionData = {
        id: formData.id,
        date: formData.date,
        district: formData.district,
        barangay: formData.barangay,
        purok: formData.purok,
        vaccinator: formData.vaccinator,
        timeStart: formData.timeStart,
        ownerName: formData.ownerName,
        address: formData.address,
        sex: formData.sex,
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
      submissionData = {
        date: route.params?.date,
        district: route.params?.district,
        barangay: route.params?.barangay,
        purok: route.params?.purok,
        vaccinator: route.params?.vaccinator,
        timeStart: route.params?.timeStart,
        ownerName: route.params?.ownerName,
        address: route.params?.address,
        sex: route.params?.sex,
        contactNo: route.params?.contactNo,
        petName,
        petAge,
        species: speciesValue,
        petSex: AnimalSexValue,
        color: colorMarkings,
        cardNo: cardNumber,
        vaccine: vaccineLotNumber,
        source: sourceOfVaccine,
        dateVaccinated: selectedDateVac,
        timeFinish: selectedFinTime,
      };
    }

    const endpoint = isEditing ? `${apiURL}/editVaccinationForm` : `${apiURL}/submitVaccinationForm`;

    axios.post(endpoint, submissionData)
      .then(response => {
        if (response.data.success) {
          if (isEditing) {
            setUpdateSuccessModalVisible(true);
          } else {
            setSuccessModalVisible(true);
          }
        }
      })
      .catch(error => {
        console.error('Error submitting Vaccination form:', error);
      });
  };

  const navigateAfterSubmit = () => {
    const position = user.position;
    if (isEdit) {
      navigation.navigate('Field_vacc_archives');
    } else if (position === 'CVO' || position === 'RabDash') {
      navigation.navigate('VetInputForms');
    } else if (position === 'Private Veterinarian') {
      navigation.navigate('InputForms');
    } else {
      console.warn('Unknown user position:', position);
    }
  };

  return (
    <FormScreen title="Rabies Field Vaccination Form (Part 2)">
      <FormSectionLabel title="Animal Information" first />
      <AppInput label="Name" placeholder="Browny" value={petName} onChangeText={setpetName} />
      <AppInput label="Age" placeholder="8 months Old" value={petAge} onChangeText={setpetAge} />

      <View style={menuStyles.row}>
        <View style={menuStyles.rowButton}>
          <AppDropdown
            label="Species"
            open={isSpeciesOpen}
            value={speciesValue}
            items={SPECIES}
            setOpen={handleSpeciesOpen}
            setValue={setSpeciesValue}
            placeholder="Select species"
          />
        </View>
        <View style={menuStyles.rowButton}>
          <AppDropdown
            label="Sex"
            open={isAnimalSexOpen}
            value={AnimalSexValue}
            items={SEXES}
            setOpen={handleAnimalSexOpen}
            setValue={setAnimalSexValue}
            placeholder="Select sex"
          />
        </View>
      </View>

      <AppInput label="Color/Markings" placeholder="White" value={colorMarkings} onChangeText={setcolorMarkings} />
      <AppInput label="Card Number" placeholder="" value={cardNumber} onChangeText={setcardNumber} />

      <FormSectionLabel title="Vaccine Information" />
      <AppInput label="Vaccine/Lot No." placeholder="" value={vaccineLotNumber} onChangeText={setvaccineLotNumber} />
      <AppInput label="Source of Vaccine" placeholder="" value={sourceOfVaccine} onChangeText={setsourceOfVaccine} />

      <AppDateField label="Date Vaccinated" value={selectedDateVac} onPress={showDateVacPicker} />
      <DateTimePickerModal
        isVisible={isDateVacPickerVisible}
        mode="date"
        onConfirm={handleDateVacConfirm}
        onCancel={hideDateVacPicker}
      />

      <AppDateField label="Time Finished" mode="time" value={selectedFinTime} onPress={showFinTimePicker} />
      <DateTimePickerModal
        isVisible={isFinTimePickerVisible}
        mode="time"
        onConfirm={handleFinTimeConfirm}
        onCancel={hideFinTimePicker}
      />

      <View style={menuStyles.formActionsRow}>
        <AppButton title="Back" variant="secondary" onPress={() => navigation.navigate('Rabies_Field_Vacc_Form')} style={menuStyles.rowButton} />
        <AppButton title="Submit" variant="primary" onPress={handleSubmitPress} style={menuStyles.rowButton} />
      </View>

      <AppModal
        isVisible={isModalVisible}
        message="Please fill in all fields before submitting."
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

export default Rabies_Field_Vacc_Form2;
