import React, { useEffect, useState } from 'react';
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
import { DISTRICTS } from '../constants/districts';

const SEXES = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

const SPECIES = [
  { label: 'Canine', value: 'Canine' },
  { label: 'Feline', value: 'Feline' },
];

const Rabies_Sample_Information_Form = () => {
  const [user, setUser] = useState(null);
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null);

  const [name, setNameValue] = useState('');
  const [isSexOpen, setIsSexOpen] = useState(false);
  const [sexValue, setSexValue] = useState(null);
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [districtValue, setDistrictValue] = useState(null);
  const [barangay, setBarangay] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSpeciesOpen, setIsSpeciesOpen] = useState(false);
  const [speciesValue, setSpeciesValue] = useState(null);
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const [isModalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleDateConfirm = (date) => {
    hideDatePicker();
    setSelectedDate(date);
  };

  const handleDistrictOpen = () => {
    setIsDistrictOpen(!isDistrictOpen);
    setIsSexOpen(false);
    setIsSpeciesOpen(false);
  };

  const handleSexOpen = () => {
    setIsSexOpen(!isSexOpen);
    setIsDistrictOpen(false);
    setIsSpeciesOpen(false);
  };

  const handleSpeciesOpen = () => {
    setIsSpeciesOpen(!isSpeciesOpen);
    setIsSexOpen(false);
    setIsDistrictOpen(false);
  };

  useEffect(() => {
    axios.get(`${apiURL}/Position`)
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Error fetching position:', error);
      });

    const { item, fromArchive } = route.params || {};
    if (fromArchive && item) {
      const adjustedDate = item.date ? new Date(item.date) : new Date();
      adjustedDate.setDate(adjustedDate.getDate() + 1);

      setNameValue(item.name || '');
      setSexValue(item.sex || '');
      setAddress(item.address || '');
      setNumber(item.number || '');
      setDistrictValue(item.district || '');
      setBarangay(item.barangay || '');
      setSelectedDate(adjustedDate);
      setSpeciesValue(item.species || '');
      setBreed(item.breed || '');
      setAge(item.age || '');
    }

    if (fromArchive && item) {
      setEditableItem(item);
    }
  }, [route.params]);

  const handleNextPress = () => {
    if (
      name === '' ||
      sexValue === null ||
      address === '' ||
      number === '' ||
      districtValue === null ||
      barangay === '' ||
      selectedDate === null ||
      speciesValue === null ||
      breed === '' ||
      age === ''
    ) {
      setErrorMessage('Please fill in all fields before proceeding.');
      toggleModal();
    } else if (number.length !== 11) {
      setErrorMessage('Contact number must be exactly 11 digits.');
      toggleModal();
    } else if (editableItem) {
      const formData = {
        id: editableItem ? editableItem.id : null,
        name,
        sex: sexValue,
        address,
        number,
        district: districtValue,
        barangay,
        date: selectedDate.toISOString(),
        species: speciesValue,
        breed,
        age,
      };
      navigation.navigate('Rabies_Sample_Information_Form2', {
        formData,
        petData: editableItem,
        fromArchive: !!editableItem,
      });
    } else {
      navigation.navigate('Rabies_Sample_Information_Form2', {
        name,
        sex: sexValue,
        address,
        number,
        district: districtValue,
        barangay,
        date: selectedDate.toISOString(),
        species: speciesValue,
        breed,
        age,
        fromArchive: false,
      });
    }
  };

  const handleBackPress = () => {
    const source = route.params?.source;
    switch (source) {
      case 'Sample_form_archives':
        navigation.navigate('Sample_form_archives');
        break;
      case 'InputMenu':
        if (user.position === 'CVO' || user.position === 'RabDash') {
          navigation.navigate('VetInputForms');
        } else if (user.position === 'Private Veterinarian') {
          navigation.navigate('InputForms');
        } else {
          console.warn('Unknown user position:', user.position);
        }
        break;
      default:
        navigation.goBack();
    }
  };

  return (
    <FormScreen title="Rabies Sample Information">
      <FormSectionLabel title="Owner's Profile" first />
      <AppInput label="Name" placeholder="Name" value={name} onChangeText={setNameValue} />
      <AppDropdown
        label="Sex"
        open={isSexOpen}
        value={sexValue}
        items={SEXES}
        setOpen={handleSexOpen}
        setValue={setSexValue}
        placeholder="Select sex"
      />
      <AppInput label="Address" placeholder="Complete Address" value={address} onChangeText={setAddress} />
      <AppInput
        label="Contact Number"
        placeholder="09123456789"
        value={number}
        onChangeText={setNumber}
        keyboardType="numeric"
        maxLength={11}
      />
      <AppDropdown
        label="District"
        open={isDistrictOpen}
        value={districtValue}
        items={DISTRICTS}
        setOpen={handleDistrictOpen}
        setValue={setDistrictValue}
        placeholder="Select district"
      />
      <AppInput label="Barangay" placeholder="" value={barangay} onChangeText={setBarangay} />

      <FormSectionLabel title="Sample's Profile" />
      <AppDateField label="Date" value={selectedDate} onPress={showDatePicker} />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />
      <AppDropdown
        label="Species"
        open={isSpeciesOpen}
        value={speciesValue}
        items={SPECIES}
        setOpen={handleSpeciesOpen}
        setValue={setSpeciesValue}
        placeholder="Select species"
      />
      <AppInput label="Breed" placeholder="Azkal" value={breed} onChangeText={setBreed} />
      <AppInput label="Age" placeholder="8 months old" value={age} onChangeText={setAge} />

      <View style={menuStyles.formActionsRow}>
        <AppButton title="Back" variant="secondary" onPress={handleBackPress} style={menuStyles.rowButton} />
        <AppButton title="Next" variant="primary" onPress={handleNextPress} style={menuStyles.rowButton} />
      </View>

      <AppModal
        isVisible={isModalVisible}
        message={errorMessage}
        onBackdropPress={toggleModal}
        actions={[{ label: 'OK', onPress: toggleModal }]}
      />
    </FormScreen>
  );
};

export default Rabies_Sample_Information_Form;
