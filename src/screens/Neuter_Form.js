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

const PROCEDURES = [
  { label: 'Castration', value: 'Castration' },
  { label: 'Spraying', value: 'Spraying' },
];

const Neuter_Form = () => {
  const [user, setUser] = useState(null);
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [districtValue, setDistrictValue] = useState(null);

  const [barangayValue, setBarangayValue] = useState('');
  const [purokValue, setPurokValue] = useState('');

  const [isProcedureOpen, setIsProcedureOpen] = useState(false);
  const [procedureValue, setProcedureValue] = useState(null);

  const [clientValue, setClientValue] = useState('');
  const [addressValue, setAddressValue] = useState('');
  const [contactValue, setContactValue] = useState('');

  const [isModalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

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
    setIsProcedureOpen(false);
  };

  const handleProcedureOpen = () => {
    setIsProcedureOpen(!isProcedureOpen);
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
      const editDate = new Date(item.date);
      editDate.setDate(editDate.getDate() + 1);

      setSelectedDate(editDate);
      setDistrictValue(item.district);
      setBarangayValue(item.barangay);
      setPurokValue(item.purok);
      setProcedureValue(item.proc);
      setClientValue(item.client);
      setAddressValue(item.address);
      setContactValue(item.contactNo);
    }

    if (route.params?.fromArchive && route.params?.item) {
      setEditableItem(route.params.item);
    }
  }, [route.params]);

  const handleNextPress = () => {
    if (
      selectedDate === null ||
      districtValue === null ||
      barangayValue === '' ||
      purokValue === '' ||
      procedureValue === null ||
      clientValue === '' ||
      addressValue === '' ||
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
        proc: procedureValue,
        client: clientValue,
        address: addressValue,
        contactNo: contactValue,
      };

      navigation.navigate('Neuter_Form2', {
        formData,
        petData: editableItem,
        fromArchive: !!editableItem,
      });
    } else {
      navigation.navigate('Neuter_Form2', {
        date: selectedDate.toISOString(),
        district: districtValue,
        barangay: barangayValue,
        purok: purokValue,
        proc: procedureValue,
        client: clientValue,
        address: addressValue,
        contactNo: contactValue,
        fromArchive: false,
      });
    }
  };

  const handleBackPress = () => {
    const source = route.params?.source;
    switch (source) {
      case 'Neuter_Form_archives':
        navigation.navigate('Neuter_Form_archives');
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
    <FormScreen title="Neuter Form">
      <FormSectionLabel title="Procedure Details" first />
      <AppDateField
        label="Date"
        value={selectedDate}
        onPress={showDatePicker}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />

      <AppDropdown
        label="Procedure"
        open={isProcedureOpen}
        value={procedureValue}
        items={PROCEDURES}
        setOpen={handleProcedureOpen}
        setValue={setProcedureValue}
        placeholder="Select procedure"
      />

      <FormSectionLabel title="Location" />
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

      <FormSectionLabel title="Client Details" />
      <AppInput label="Client" placeholder="Name" value={clientValue} onChangeText={setClientValue} />
      <AppInput label="Address" placeholder="Mintal, Davao City" value={addressValue} onChangeText={setAddressValue} />
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

export default Neuter_Form;
