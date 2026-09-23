import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import {
  AppButton,
  AppInput,
  AppDateField,
  AppModal,
  FormScreen,
  FormSectionLabel,
  menuStyles,
} from '../components';

const AnimalControlForm = () => {
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [isDatePicker2Visible, setDatePicker2Visibility] = useState(false);
  const [selectedDate2, setSelectedDate2] = useState(null);

  const [cageNumberValue, setCageNumberValue] = useState('');
  const [impHeadsValue, setImpHeadsValue] = useState('');
  const [claimedHeadsValue, setClaimedHeadsValue] = useState('');

  const [isDatePicker3Visible, setDatePicker3Visibility] = useState(false);
  const [selectedDate3, setSelectedDate3] = useState(null);

  const [euthHeadsValue, setEuthHeadsValue] = useState('');

  const [isDatePicker4Visible, setDatePicker4Visibility] = useState(false);
  const [selectedDate4, setSelectedDate4] = useState(null);

  const [chiefValue, setChiefValue] = useState('');

  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  const navigation = useNavigation();

  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isUpdateSuccessModalVisible, setUpdateSuccessModalVisible] = useState(false);

  const apiURL = process.env.EXPO_PUBLIC_URL;

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (date) => {
    hideDatePicker();
    setSelectedDate(date);
  };

  const showDatePicker2 = () => setDatePicker2Visibility(true);
  const hideDatePicker2 = () => setDatePicker2Visibility(false);
  const handleDateConfirm2 = (date2) => {
    hideDatePicker2();
    setSelectedDate2(date2);
  };

  const showDatePicker3 = () => setDatePicker3Visibility(true);
  const hideDatePicker3 = () => setDatePicker3Visibility(false);
  const handleDateConfirm3 = (date3) => {
    hideDatePicker3();
    setSelectedDate3(date3);
  };

  const showDatePicker4 = () => setDatePicker4Visibility(true);
  const hideDatePicker4 = () => setDatePicker4Visibility(false);
  const handleDateConfirm4 = (date4) => {
    hideDatePicker4();
    setSelectedDate4(date4);
  };

  useEffect(() => {
    const { item, fromArchive } = route.params || {};
    if (fromArchive && item) {
      const adjustedDate = new Date(item.date1);
      adjustedDate.setDate(adjustedDate.getDate() + 1);

      const adjustedDate2 = new Date(item.date2);
      adjustedDate2.setDate(adjustedDate2.getDate() + 1);

      const adjustedDate3 = new Date(item.date3);
      adjustedDate3.setDate(adjustedDate3.getDate() + 1);

      const adjustedDate4 = new Date(item.date4);
      adjustedDate4.setDate(adjustedDate4.getDate() + 1);

      setSelectedDate(adjustedDate);
      setCageNumberValue(item.cageNum);
      setImpHeadsValue(item.impHeads.toString());
      setSelectedDate2(adjustedDate2);
      setClaimedHeadsValue(item.claimedHeads.toString());
      setSelectedDate3(adjustedDate3);
      setEuthHeadsValue(item.euthHeads.toString());
      setSelectedDate4(adjustedDate4);
      setChiefValue(item.chief);

      if (route.params?.fromArchive && route.params?.item) {
        setEditableItem(route.params.item);
      }
    }
  }, [route.params]);

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
      cageNumberValue === '' ||
      impHeadsValue === '' ||
      selectedDate2 === null ||
      claimedHeadsValue === '' ||
      selectedDate3 === null ||
      euthHeadsValue === '' ||
      selectedDate4 === null ||
      chiefValue === ''
    ) {
      toggleModal();
    } else {
      toggleConfirmModal();
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  const submitForm = () => {
    const formData = {
      date1: formatDate(selectedDate),
      cageNum: cageNumberValue,
      impHeads: impHeadsValue,
      date2: formatDate(selectedDate2),
      claimedHeads: claimedHeadsValue,
      date3: formatDate(selectedDate3),
      euthHeads: euthHeadsValue,
      date4: formatDate(selectedDate4),
      chief: chiefValue,
    };

    const isEditing = editableItem !== null;
    const apiUrl = isEditing ? `${apiURL}/editAnimalControlForm` : `${apiURL}/submitAnimalControlForm`;

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
      navigation.navigate('AnimalControlArchives');
    } else {
      navigation.navigate('VetInputForms');
    }
  };

  return (
    <FormScreen title="Animal Control & Rehabilitation">
      <View style={menuStyles.row}>
        <View style={menuStyles.rowButton}>
          <AppDateField label="Date" value={selectedDate} onPress={showDatePicker} />
        </View>
        <View style={menuStyles.rowButton}>
          <AppInput label="Cage Number" placeholder="3" value={cageNumberValue} onChangeText={setCageNumberValue} />
        </View>
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />

      <FormSectionLabel title="Impounded" />
      <View style={menuStyles.row}>
        <View style={menuStyles.rowButton}>
          <AppInput label="No. of Heads" placeholder="3" value={impHeadsValue} onChangeText={setImpHeadsValue} keyboardType="numeric" />
        </View>
        <View style={menuStyles.rowButton}>
          <AppDateField label="Date" value={selectedDate2} onPress={showDatePicker2} />
        </View>
      </View>
      <DateTimePickerModal
        isVisible={isDatePicker2Visible}
        mode="date"
        onConfirm={handleDateConfirm2}
        onCancel={hideDatePicker2}
      />

      <FormSectionLabel title="Claimed" />
      <View style={menuStyles.row}>
        <View style={menuStyles.rowButton}>
          <AppInput label="No. of Heads" placeholder="4" value={claimedHeadsValue} onChangeText={setClaimedHeadsValue} keyboardType="numeric" />
        </View>
        <View style={menuStyles.rowButton}>
          <AppDateField label="Date" value={selectedDate3} onPress={showDatePicker3} />
        </View>
      </View>
      <DateTimePickerModal
        isVisible={isDatePicker3Visible}
        mode="date"
        onConfirm={handleDateConfirm3}
        onCancel={hideDatePicker3}
      />

      <FormSectionLabel title="Euthanized" />
      <View style={menuStyles.row}>
        <View style={menuStyles.rowButton}>
          <AppInput label="No. of Heads" placeholder="1" value={euthHeadsValue} onChangeText={setEuthHeadsValue} keyboardType="numeric" />
        </View>
        <View style={menuStyles.rowButton}>
          <AppDateField label="Date" value={selectedDate4} onPress={showDatePicker4} />
        </View>
      </View>
      <DateTimePickerModal
        isVisible={isDatePicker4Visible}
        mode="date"
        onConfirm={handleDateConfirm4}
        onCancel={hideDatePicker4}
      />

      <AppInput label="Chief of Operation/Team Leader*" placeholder="" value={chiefValue} onChangeText={setChiefValue} />

      <View style={menuStyles.formActionsRow}>
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

export default AnimalControlForm;
