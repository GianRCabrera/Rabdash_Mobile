import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import { AppButton, AppInput, AppDateField, AppDropdown, AppModal, FormScreen, menuStyles } from '../components';

const DISTRICTS = [
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
];

const IECForm = () => {
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null);

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
    setSelectedDate(date);
  };

  useEffect(() => {
    const { item, fromArchive } = route.params || {};

    if (fromArchive && !item) {
      console.error('No item data provided.');
      navigation.goBack();
      return;
    }

    if (fromArchive && item) {
      const adjustedDate = new Date(item.date);
      adjustedDate.setDate(adjustedDate.getDate() + 1);

      setSelectedDate(adjustedDate);
      setTitleValue(item.title);
      setDistrictValue(item.district);
      setBarangayValue(item.barangay);
      setPurokValue(item.purok);
      setParticipantValue(item.participants.toString());
      setBrochureValue(item.brochure);
      setMaterialValue(item.materials.toString());

      setEditableItem(item);
    }
  }, [route.params, navigation]);

  const handleBackPress = () => {
    const backTo = route.params?.from;
    switch (backTo) {
      case 'ArchiveMenu':
        navigation.navigate('ClientDatabase');
        break;
      case 'VetInputForms':
        navigation.navigate('VetInputForms');
        break;
      default:
        navigation.goBack();
    }
  };

  const handleSubmitPress = () => {
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
      toggleConfirmModal();
    }
  };

  const submitForm = () => {
    const submitUrl = `${apiURL}/submitIECForm`;
    const editUrl = `${apiURL}/editIECForm`;

    const formData = {
      date: selectedDate.toISOString().split('T')[0],
      title: titleValue,
      district: districtValue,
      barangay: barangayValue,
      purok: purokValue,
      participants: participantValue,
      brochure: brochureValue,
      materials: materialValue,
    };

    const isEditing = editableItem !== null;
    const apiUrl = isEditing ? editUrl : submitUrl;

    if (isEditing) {
      formData.id = editableItem.id;
    }

    axios.post(apiUrl, formData)
      .then(response => {
        console.log(response.data);
        if (isEditing) {
          setUpdateSuccessModalVisible(true);
        } else {
          setSuccessModalVisible(true);
        }
      })
      .catch(error => {
        console.error('Error submitting form:', error);
      });
  };

  const navigateAfterSubmit = () => {
    if (editableItem) {
      navigation.navigate('IECFormArchive');
    } else {
      navigation.navigate('VetInputForms');
    }
  };

  return (
    <FormScreen title="IEC Form">
      <AppDateField
        label="Date"
        value={selectedDate ? selectedDate.toDateString() : null}
        placeholder="Select Date"
        onPress={showDatePicker}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />

      <AppInput label="Title" placeholder="" value={titleValue} onChangeText={setTitleValue} />

      <AppDropdown
        label="District"
        open={isDistrictOpen}
        value={districtValue}
        items={DISTRICTS}
        setOpen={setIsDistrictOpen}
        setValue={setDistrictValue}
        placeholder="Please select first"
      />

      <AppInput label="Barangay" placeholder="Enter Barangay" value={barangayValue} onChangeText={setBarangayValue} />

      <AppInput label="Purok" placeholder="Purok 1-A" value={purokValue} onChangeText={setPurokValue} />

      <AppInput
        label="No. of Participants"
        placeholder="10"
        value={participantValue}
        onChangeText={setParticipantValue}
        keyboardType="numeric"
      />

      <AppInput label="Brochure (Kind)" placeholder="Paper" value={brochureValue} onChangeText={setBrochureValue} />

      <AppInput
        label="No. of Materials"
        placeholder="12"
        value={materialValue}
        onChangeText={setMaterialValue}
        keyboardType="numeric"
      />

      <View style={menuStyles.row}>
        <AppButton title="Back" variant="secondary" onPress={handleBackPress} style={menuStyles.rowButton} />
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

export default IECForm;
