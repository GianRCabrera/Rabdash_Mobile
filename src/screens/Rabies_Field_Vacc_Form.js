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

const Rabies_Field_Vacc_Form = () => {
  const [user, setUser] = useState(null);
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [districtValue, setDistrictValue] = useState(null);

  const [barangayValue, setBarangayValue] = useState('');
  const [purokValue, setPurokValue] = useState('');
  const [vaccinatorValue, setVaccinatorValue] = useState('');
  const [owner_nameValue, setOwner_nameValue] = useState('');
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [addressValue, setAddressValue] = useState('');
  const [isSexOpen, setIsSexOpen] = useState(false);
  const [sexValue, setSexValue] = useState(null);
  const [contactValue, setContactValue] = useState('');

  const [isModalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleDateConfirm = (date) => {
    hideDatePicker();
    setSelectedDate(date);
  };

  const handleDistrictOpen = () => {
    setIsDistrictOpen(!isDistrictOpen);
    setIsSexOpen(false);
  };

  const handleSexOpen = () => {
    setIsSexOpen(!isSexOpen);
    setIsDistrictOpen(false);
  };

  const showTimePicker = () => setTimePickerVisible(true);
  const hideTimePicker = () => setTimePickerVisible(false);

  const handleTimeConfirm = (time) => {
    setSelectedTime(time);
    hideTimePicker();
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
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
      const adjustedDate = new Date(item.date);
      adjustedDate.setDate(adjustedDate.getDate() + 1);

      setSelectedDate(adjustedDate);
      setDistrictValue(item.district);
      setBarangayValue(item.barangay);
      setPurokValue(item.purok);
      setVaccinatorValue(item.vaccinator);
      setSelectedTime(item.timeStart ? new Date(`1970-01-01T${item.timeStart}Z`) : null);
      setOwner_nameValue(item.ownerName);
      setAddressValue(item.address);
      setSexValue(item.sex);
      setContactValue(item.contactNo);
    }

    if (route.params?.fromArchive && route.params?.item) {
      setEditableItem(route.params.item);
    }
  }, [route.params, apiURL]);

  const handleNextPress = () => {
    if (
      selectedDate === null ||
      districtValue === null ||
      barangayValue === '' ||
      purokValue === '' ||
      vaccinatorValue === '' ||
      selectedTime === null ||
      owner_nameValue === '' ||
      addressValue === '' ||
      sexValue === null ||
      contactValue === ''
    ) {
      setErrorMessage('Please fill in all fields before proceeding.');
      toggleModal();
    } else if (contactValue.length !== 11) {
      setErrorMessage('Contact number must be exactly 11 digits.');
      toggleModal();
    } else if (editableItem) {
      const formData = {
        id: editableItem ? editableItem.id : null,
        date: selectedDate.toISOString(),
        district: districtValue,
        barangay: barangayValue,
        purok: purokValue,
        vaccinator: vaccinatorValue,
        timeStart: selectedTime.toISOString(),
        ownerName: owner_nameValue,
        address: addressValue,
        sex: sexValue,
        contactNo: contactValue,
      };
      navigation.navigate('Rabies_Field_Vacc_Form2', {
        formData,
        petData: editableItem,
        fromArchive: !!editableItem,
      });
    } else {
      navigation.navigate('Rabies_Field_Vacc_Form2', {
        date: selectedDate.toISOString(),
        district: districtValue,
        barangay: barangayValue,
        purok: purokValue,
        vaccinator: vaccinatorValue,
        timeStart: selectedTime.toISOString(),
        ownerName: owner_nameValue,
        address: addressValue,
        sex: sexValue,
        contactNo: contactValue,
        fromArchive: false,
      });
    }
  };

  const handleBackPress = () => {
    const source = route.params?.source;
    switch (source) {
      case 'Field_vacc_archives':
        navigation.navigate('Field_vacc_archives');
        break;
      case 'InputMenu': {
        const position = user?.position;
        if (position === 'CVO' || position === 'RabDash') {
          navigation.navigate('VetInputForms');
        } else if (position === 'Private Veterinarian') {
          navigation.navigate('InputForms');
        } else {
          console.warn('Unknown user position:', position);
        }
        break;
      }
      default:
        navigation.goBack();
    }
  };

  return (
    <FormScreen title="Rabies Field Vaccination Form">
      <FormSectionLabel title="Vaccination Details" first />
      <AppDateField label="Date" value={selectedDate} onPress={showDatePicker} />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
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
      <AppInput label="Barangay" placeholder="Enter Barangay" value={barangayValue} onChangeText={setBarangayValue} />
      <AppInput label="Purok" placeholder="Enter Purok" value={purokValue} onChangeText={setPurokValue} />
      <AppInput label="Vaccinator/s" placeholder="Juan Dela Cruz" value={vaccinatorValue} onChangeText={setVaccinatorValue} />
      <AppDateField label="Time Started" mode="time" value={selectedTime} onPress={showTimePicker} />
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={hideTimePicker}
      />

      <FormSectionLabel title="Owner's Profile" />
      <AppInput label="Name" placeholder="John Cena" value={owner_nameValue} onChangeText={setOwner_nameValue} />
      <AppInput label="Address" placeholder="Mintal, Davao City" value={addressValue} onChangeText={setAddressValue} />
      <AppDropdown
        label="Sex"
        open={isSexOpen}
        value={sexValue}
        items={SEXES}
        setOpen={handleSexOpen}
        setValue={setSexValue}
        placeholder="Select sex"
      />
      <AppInput
        label="Contact No."
        placeholder="09123456789"
        value={contactValue}
        onChangeText={setContactValue}
        keyboardType="numeric"
        maxLength={11}
      />

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

export default Rabies_Field_Vacc_Form;
