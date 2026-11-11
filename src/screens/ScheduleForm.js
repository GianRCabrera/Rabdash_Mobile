import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { AppButton, AppInput, AppDateField, AppDropdown, AppModal, FormScreen, FormSectionLabel, menuStyles } from '../components';
import { DISTRICTS } from '../constants/districts';
import { useSubmission } from '../utils/useSubmission';

const ScheduleForm = () => {
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null);

  const navigation = useNavigation();

  const { isSubmitting, submitError, clearSubmitError, send } = useSubmission();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [districtValue, setDistrictValue] = useState(null);

  const [titleValue, setTitleValue] = useState('');
  const [barangayValue, setBarangayValue] = useState('');
  const [purokValue, setPurokValue] = useState('');

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

    if (fromArchive && item) {
      const adjustedDate = new Date(item.date);
      adjustedDate.setDate(adjustedDate.getDate() + 1);

      setSelectedDate(adjustedDate);
      setTitleValue(item.title);
      setDistrictValue(item.district);
      setBarangayValue(item.barangay);
      setPurokValue(item.purok);

      setEditableItem(item);
    }
  }, [route.params]);

  const handleBackPress = () => {
    const backTo = route.params?.from;
    switch (backTo) {
      case 'ArchiveMenu':
        navigation.navigate('ClientDatabase', undefined, { pop: true });
        break;
      case 'VetInputForms':
        navigation.navigate('VetInputForms', undefined, { pop: true });
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
      purokValue === ''
    ) {
      toggleModal();
    } else {
      toggleConfirmModal();
    }
  };

  const submitForm = () => {
    const formData = {
      date: selectedDate.toISOString().slice(0, 10),
      title: titleValue,
      district: districtValue,
      barangay: barangayValue,
      purok: purokValue,
    };

    const isEditing = editableItem !== null;
    const apiUrl = isEditing ? `${apiURL}/editScheduleForm` : `${apiURL}/submitScheduleForm`;

    if (isEditing) {
      formData.id = editableItem.id;
    }

    send(apiUrl, formData).then((response) => {
      if (!response) return;
      console.log(response.data);
      if (isEditing) {
        setUpdateSuccessModalVisible(true);
      } else {
        setSuccessModalVisible(true);
      }
    });
  };

  const navigateAfterSubmit = () => {
    if (editableItem) {
      navigation.navigate('ScheduleFormArchive', undefined, { pop: true });
    } else {
      navigation.navigate('VetInputForms', undefined, { pop: true });
    }
  };

  return (
    <FormScreen title="Schedule Form">
      <FormSectionLabel title="Event Details" first />
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

      <AppInput label="Title" placeholder="" value={titleValue} onChangeText={setTitleValue} />

      <FormSectionLabel title="Location" />
      <AppDropdown
        label="District"
        open={isDistrictOpen}
        value={districtValue}
        items={DISTRICTS}
        setOpen={setIsDistrictOpen}
        setValue={setDistrictValue}
        placeholder="Select district"
      />

      <AppInput label="Barangay" placeholder="Enter Barangay" value={barangayValue} onChangeText={setBarangayValue} />

      <AppInput label="Purok" placeholder="Enter Purok" value={purokValue} onChangeText={setPurokValue} />

      <View style={menuStyles.formActionsRow}>
        <AppButton title="Back" variant="secondary" onPress={handleBackPress} style={menuStyles.rowButton} />
        <AppButton title="Submit" variant="primary" onPress={handleSubmitPress} loading={isSubmitting} style={menuStyles.rowButton} />
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

      <AppModal
        isVisible={submitError !== null}
        message={submitError}
        onBackdropPress={clearSubmitError}
        actions={[{ label: 'OK', onPress: clearSubmitError }]}
      />
    </FormScreen>
  );
};

export default ScheduleForm;
