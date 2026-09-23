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

const CATEGORIES = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
];

const YES_NO = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

const OUTCOMES = [
  { label: 'C', value: 'C' },
  { label: 'Inc', value: 'Inc' },
  { label: 'N', value: 'N' },
  { label: 'D', value: 'D' },
];

const BITING_STATUSES = [
  { label: 'Alive', value: 'Alive' },
  { label: 'Dead', value: 'Dead' },
  { label: 'Lost', value: 'Lost' },
];

const formatDateTime = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return null;
  }
  date.setHours(date.getHours() - 4);
  return date;
};

const Rabies_Exposure_Form2 = () => {
  const [route1, setRoute1] = useState('');
  const [brand, setBrand] = useState('');
  const [remarks, setRemarks] = useState('');

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);

  const [isWashingOpen, setIsWashingOpen] = useState(false);
  const [washingValue, setWashingValue] = useState(null);

  const [isDateTimePickerVisible, setDateTimePickerVisibility] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const [isDateTimePickerVisible2, setDateTimePickerVisibility2] = useState(false);
  const [selectedDateTime2, setSelectedDateTime2] = useState(null);

  const [isDateTimePickerVisible3, setDateTimePickerVisibility3] = useState(false);
  const [selectedDateTime3, setSelectedDateTime3] = useState(null);

  const [isDateTimePickerVisible4, setDateTimePickerVisibility4] = useState(false);
  const [selectedDateTime4, setSelectedDateTime4] = useState(null);

  const [isDateTimePickerVisible5, setDateTimePickerVisibility5] = useState(false);
  const [selectedDateTime5, setSelectedDateTime5] = useState(null);

  const [isDateTimePickerVisible6, setDateTimePickerVisibility6] = useState(false);
  const [selectedDateTime6, setSelectedDateTime6] = useState(null);

  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [outcomeValue, setOutcomeValue] = useState(null);

  const [isBitingStatusOpen, setIsBitingStatusOpen] = useState(false);
  const [bitingStatusValue, setBitingStatusValue] = useState(null);

  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isUpdateSuccessModalVisible, setUpdateSuccessModalVisible] = useState(false);

  const [submissionResponse, setSubmissionResponse] = useState(null);
  const [isFormEdit, setIsFormEdit] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;
  const route = useRoute();

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const showDateTimePicker = () => setDateTimePickerVisibility(true);
  const hideDateTimePicker = () => setDateTimePickerVisibility(false);
  const handleDateTimeConfirm = (dateTime) => {
    hideDateTimePicker();
    setSelectedDateTime(dateTime);
  };

  const showDateTimePicker2 = () => setDateTimePickerVisibility2(true);
  const hideDateTimePicker2 = () => setDateTimePickerVisibility2(false);
  const handleDateTimeConfirm2 = (dateTime2) => {
    hideDateTimePicker2();
    setSelectedDateTime2(dateTime2);
  };

  const showDateTimePicker3 = () => setDateTimePickerVisibility3(true);
  const hideDateTimePicker3 = () => setDateTimePickerVisibility3(false);
  const handleDateTimeConfirm3 = (dateTime3) => {
    hideDateTimePicker3();
    setSelectedDateTime3(dateTime3);
  };

  const showDateTimePicker4 = () => setDateTimePickerVisibility4(true);
  const hideDateTimePicker4 = () => setDateTimePickerVisibility4(false);
  const handleDateTimeConfirm4 = (dateTime4) => {
    hideDateTimePicker4();
    setSelectedDateTime4(dateTime4);
  };

  const showDateTimePicker5 = () => setDateTimePickerVisibility5(true);
  const hideDateTimePicker5 = () => setDateTimePickerVisibility5(false);
  const handleDateTimeConfirm5 = (dateTime5) => {
    hideDateTimePicker5();
    setSelectedDateTime5(dateTime5);
  };

  const showDateTimePicker6 = () => setDateTimePickerVisibility6(true);
  const hideDateTimePicker6 = () => setDateTimePickerVisibility6(false);
  const handleDateTimeConfirm6 = (dateTime6) => {
    hideDateTimePicker6();
    setSelectedDateTime6(dateTime6);
  };

  const handleCategoryOpen = () => {
    setIsCategoryOpen(!isCategoryOpen);
    setIsWashingOpen(false);
    setIsOutcomeOpen(false);
    setIsBitingStatusOpen(false);
  };

  const handleWashingOpen = () => {
    setIsWashingOpen(!isWashingOpen);
    setIsCategoryOpen(false);
    setIsOutcomeOpen(false);
    setIsBitingStatusOpen(false);
  };

  const handleOutcomeOpen = () => {
    setIsOutcomeOpen(!isOutcomeOpen);
    setIsBitingStatusOpen(false);
    setIsWashingOpen(false);
    setIsCategoryOpen(false);
  };

  const handleBitingStatusOpen = () => {
    setIsBitingStatusOpen(!isBitingStatusOpen);
    setIsOutcomeOpen(false);
    setIsWashingOpen(false);
    setIsCategoryOpen(false);
  };

  useEffect(() => {
    const { petData } = route.params || {};

    if (petData) {
      setCategoryValue(petData.category || '');
      setWashingValue(petData.washing || '');
      setSelectedDateTime(formatDateTime(petData.RIG));
      setRoute1(petData.route || null);
      setSelectedDateTime2(formatDateTime(petData.d0));
      setSelectedDateTime3(formatDateTime(petData.d3));
      setSelectedDateTime4(formatDateTime(petData.d7));
      setSelectedDateTime5(formatDateTime(petData.d14));
      setSelectedDateTime6(formatDateTime(petData.d28));
      setBrand(petData.brand || '');
      setOutcomeValue(petData.outcome || '');
      setBitingStatusValue(petData.bitingStatus || '');
      setRemarks(petData.remarks || '');
    }
  }, [route.params]);

  const handleSubmitPress = () => {
    if (
      categoryValue === null ||
      washingValue === null ||
      selectedDateTime == null ||
      route1 == '' ||
      selectedDateTime2 == null ||
      selectedDateTime3 == null ||
      selectedDateTime4 == null ||
      selectedDateTime5 == null ||
      selectedDateTime6 == null ||
      brand === '' ||
      outcomeValue === null ||
      bitingStatusValue === null ||
      remarks === ''
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
        regNo: formData.regNo,
        regDate: formData.regDate,
        name: formData.name,
        address: formData.address,
        age: formData.age,
        sex: formData.sex,
        expDate: formData.expDate,
        place: formData.place,
        typeAnimal: formData.typeAnimal,
        typeBNB: formData.typeBNB,
        site: formData.site,
        category: categoryValue,
        washing: washingValue,
        RIG: selectedDateTime,
        route: route1,
        d0: selectedDateTime2,
        d3: selectedDateTime3,
        d7: selectedDateTime4,
        d14: selectedDateTime5,
        d28: selectedDateTime6,
        brand,
        outcome: outcomeValue,
        bitingStatus: bitingStatusValue,
        remarks,
      };
    } else {
      submissionData = {
        regNo: route.params?.regNo,
        regDate: route.params?.regDate,
        name: route.params?.name,
        address: route.params?.address,
        age: route.params?.age,
        sex: route.params?.sex,
        expDate: route.params?.expDate,
        place: route.params?.place,
        typeAnimal: route.params?.typeAnimal,
        typeBNB: route.params?.typeBNB,
        site: route.params?.site,
        category: categoryValue,
        washing: washingValue,
        RIG: selectedDateTime,
        route: route1,
        d0: selectedDateTime2,
        d3: selectedDateTime3,
        d7: selectedDateTime4,
        d14: selectedDateTime5,
        d28: selectedDateTime6,
        brand,
        outcome: outcomeValue,
        bitingStatus: bitingStatusValue,
        remarks,
      };
    }

    const endpoint = isEditing ? `${apiURL}/editRabiesExposureForm` : `${apiURL}/submitRabiesExposureForm`;

    axios.post(endpoint, submissionData)
      .then(response => {
        if (response.data.success) {
          setSubmissionResponse(response.data);
          setIsFormEdit(isEditing);
          if (isEditing) {
            setUpdateSuccessModalVisible(true);
          } else {
            setSuccessModalVisible(true);
          }
        }
      })
      .catch(error => {
        console.error('Error submitting Rabies Exposure form:', error);
      });
  };

  const navigateAfterSubmit = () => {
    if (isFormEdit) {
      navigation.navigate('Rabies_Exposure_Form_Archive');
    } else {
      navigation.navigate('VetInputForms');
    }
  };

  return (
    <FormScreen title="Rabies Exposure Form (Part 2)">
      <FormSectionLabel title="Post Exposure Prophylaxis (PEP)" first />
      <AppDropdown
        label="Category (1, 2, and 3)"
        open={isCategoryOpen}
        value={categoryValue}
        items={CATEGORIES}
        setOpen={handleCategoryOpen}
        setValue={setCategoryValue}
        placeholder="Select category"
      />
      <AppDropdown
        label="Washing of Bite"
        open={isWashingOpen}
        value={washingValue}
        items={YES_NO}
        setOpen={handleWashingOpen}
        setValue={setWashingValue}
        placeholder="Select answer"
      />
      <AppDateField label="RIG Date Given" mode="datetime" value={selectedDateTime} onPress={showDateTimePicker} />
      <DateTimePickerModal
        isVisible={isDateTimePickerVisible}
        mode="datetime"
        onConfirm={handleDateTimeConfirm}
        onCancel={hideDateTimePicker}
      />

      <FormSectionLabel title="Tissue Culture Vaccine (Date Given)" />
      <View style={menuStyles.row}>
        <View style={menuStyles.rowButton}>
          <AppInput label="Route" placeholder="" value={route1} onChangeText={setRoute1} />
        </View>
        <View style={menuStyles.rowButton}>
          <AppDateField label="D0" mode="datetime" value={selectedDateTime2} onPress={showDateTimePicker2} />
        </View>
      </View>
      <DateTimePickerModal
        isVisible={isDateTimePickerVisible2}
        mode="datetime"
        onConfirm={handleDateTimeConfirm2}
        onCancel={hideDateTimePicker2}
      />

      <View style={menuStyles.row}>
        <View style={menuStyles.rowButton}>
          <AppDateField label="D3" mode="datetime" value={selectedDateTime3} onPress={showDateTimePicker3} />
        </View>
        <View style={menuStyles.rowButton}>
          <AppDateField label="D7" mode="datetime" value={selectedDateTime4} onPress={showDateTimePicker4} />
        </View>
      </View>
      <DateTimePickerModal
        isVisible={isDateTimePickerVisible3}
        mode="datetime"
        onConfirm={handleDateTimeConfirm3}
        onCancel={hideDateTimePicker3}
      />
      <DateTimePickerModal
        isVisible={isDateTimePickerVisible4}
        mode="datetime"
        onConfirm={handleDateTimeConfirm4}
        onCancel={hideDateTimePicker4}
      />

      <View style={menuStyles.row}>
        <View style={menuStyles.rowButton}>
          <AppDateField label="D14" mode="datetime" value={selectedDateTime5} onPress={showDateTimePicker5} />
        </View>
        <View style={menuStyles.rowButton}>
          <AppDateField label="D28" mode="datetime" value={selectedDateTime6} onPress={showDateTimePicker6} />
        </View>
      </View>
      <DateTimePickerModal
        isVisible={isDateTimePickerVisible5}
        mode="datetime"
        onConfirm={handleDateTimeConfirm5}
        onCancel={hideDateTimePicker5}
      />
      <DateTimePickerModal
        isVisible={isDateTimePickerVisible6}
        mode="datetime"
        onConfirm={handleDateTimeConfirm6}
        onCancel={hideDateTimePicker6}
      />

      <View style={menuStyles.row}>
        <View style={menuStyles.rowButton}>
          <AppInput label="Brand Name" placeholder="" value={brand} onChangeText={setBrand} />
        </View>
        <View style={menuStyles.rowButton}>
          <AppDropdown
            label="Outcome (C/Inc/N/D)"
            open={isOutcomeOpen}
            value={outcomeValue}
            items={OUTCOMES}
            setOpen={handleOutcomeOpen}
            setValue={setOutcomeValue}
            placeholder="Select outcome"
          />
        </View>
      </View>

      <AppDropdown
        label="Biting Animal Status (Alive/Dead/Lost)"
        open={isBitingStatusOpen}
        value={bitingStatusValue}
        items={BITING_STATUSES}
        setOpen={handleBitingStatusOpen}
        setValue={setBitingStatusValue}
        placeholder="Select status"
      />

      <AppInput label="Remarks" placeholder="" value={remarks} onChangeText={setRemarks} />

      <View style={menuStyles.formActionsRow}>
        <AppButton title="Back" variant="secondary" onPress={() => navigation.navigate('Rabies_Exposure_Form1')} style={menuStyles.rowButton} />
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

export default Rabies_Exposure_Form2;
