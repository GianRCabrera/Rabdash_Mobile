import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Modal from 'react-native-modal';
import axios from 'axios';
import styles from './styles/forms';

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

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

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

  const handleDistrictChange = (value) => {
    setDistrictValue(value);
  };

  const handleSexChange = (value) => {
    setSexValue(value);
  };

  const handleSpeciesChange = (value) => {
    setSpeciesValue(value);
  };

  const handleNameChange = (value) => {
    setNameValue(value);
  };

  const handleAddressChange = (value) => {
    setAddress(value);
  };

  const handleNumberChange = (value) => {
    setNumber(value);
  };

  const handleBarangayChange = (value) => {
    setBarangay(value);
  };

  const handleBreedChange = (value) => {
    setBreed(value);
  };

  const handleAgeChange = (value) => {
    setAge(value);
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
    } else {
      if (editableItem) {
        const formData = {
          id: editableItem ? editableItem.id : null,
          name,
          sex: sexValue,
          address: address,
          number,
          district: districtValue,
          barangay: barangay,
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
          date: selectedDate,
          species: speciesValue,
          breed,
          age,
          fromArchive: false,
        });
      }
    }
  };

  const handleBackPress = () => {
    const source = route.params?.source;
    switch (source) {
      case 'Sample_form_archives':
        navigation.navigate('Sample_form_archives');
        break;
      case 'InputMenu':
        if (user.position === 'CVO' || user.position === 'Rabdash') {
          navigation.navigate('VetInputForms');
        } else if (user.position === 'Private Veterinarian') {
          navigation.navigate('InputForms');
        } else {
          console.warn('Unknown user position:', user.position);
        }
        break;
      default:
        navigation.goBack();
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainersample}>
        <Text style={styles.header}>Rabies Sample Information</Text>
      </View>

      <View style={styles.whiteContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContainer}
          nestedScrollEnabled={true}
        >
          <View style={styles.greenContainer}>
            <Text style={styles.greenText}>Input "N/A" if information is unavailable</Text>
          </View>

          <View style={styles.rowContainer}>
            <Text style={styles.headerText}>Owner's Profile</Text>
          </View>

          <View style={styles.rowContainer2}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>Name</Text>
              <TextInput
                style={styles.textBox2}
                placeholder="Name"
                value={name}
                onChangeText={handleNameChange}
              />
            </View>
          </View>

          <View style={styles.rowContainer2}>
            <View style={styles.dropdownContainer}>
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
                listMode="SCROLLVIEW"
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>
          </View>

          <View style={styles.rowContainer2}>
            <View style={styles.dropdownContainer}>
              <Text style={styles.labelText}>Address</Text>
              <TextInput
                style={styles.textBox2}
                placeholder="Complete Address"
                value={address}
                onChangeText={handleAddressChange}
              />
            </View>
          </View>

          <View style={styles.rowContainer2}>
            <View style={styles.dropdownContainer}>
              <Text style={styles.labelText}>Contact Number</Text>
              <TextInput
                style={styles.textBox}
                placeholder="09123456789"
                value={number}
                onChangeText={handleNumberChange}
                keyboardType="numeric"
                maxLength={11}
              />
            </View>

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
                listMode="SCROLLVIEW"
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>
          </View>

          <View style={styles.rowContainer2}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>Barangay</Text>
              <TextInput
                style={styles.textBox2}
                placeholder=" "
                value={barangay}
                onChangeText={handleBarangayChange}
              />
            </View>
          </View>

          <View style={styles.rowContainer2}>
            <Text style={styles.headerText}>Sample's Profile</Text>
          </View>

          <View style={styles.rowContainer2}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>Date</Text>
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
                listMode="SCROLLVIEW"
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>
          </View>

          <View style={styles.rowContainer2}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>Breed</Text>
              <TextInput
                style={styles.textBox}
                placeholder="Azkal"
                value={breed}
                onChangeText={handleBreedChange}
              />
            </View>

            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>Age</Text>
              <TextInput
                style={styles.textBox}
                placeholder="8 months old"
                value={age}
                onChangeText={handleAgeChange}
              />
            </View>
          </View>

          <View style={styles.rowContainer2}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleBackPress}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleNextPress}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>

          <Modal isVisible={isModalVisible}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>{errorMessage}</Text>
              <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </View>
  );
};

export default Rabies_Sample_Information_Form;
