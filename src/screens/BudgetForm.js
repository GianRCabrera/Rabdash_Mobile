import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { AppButton, AppInput, AppDateField, AppModal, FormScreen, menuStyles } from '../components';
import { useSubmission } from '../utils/useSubmission';

const BudgetForm = () => {
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);

  const apiURL = process.env.EXPO_PUBLIC_URL;
  const navigation = useNavigation();
  const { isSubmitting, submitError, clearSubmitError, send } = useSubmission();

  const [budgetValue, setBudgetValue] = useState('');
  const [costvaxValue, setCostvaxValue] = useState('');

  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isUpdateSuccessModalVisible, setUpdateSuccessModalVisible] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState('Please fill in all fields before proceeding.');

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
    setSelectedYear(date);
  };

  const handleBudgetChange = (text) => {
    setBudgetValue(text);
  };

  const handleCostvaxChange = (text) => {
    setCostvaxValue(text);
  };

  useEffect(() => {
    const { item, fromArchive } = route.params || {};
    if (fromArchive && item) {
      const yearDate = new Date(item.year, 0);

      setSelectedYear(yearDate);
      setBudgetValue(item.budget.toString());
      setCostvaxValue(item.costvax.toString());

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
      selectedYear === null ||
      budgetValue === '' ||
      costvaxValue === ''
    ) {
      setValidationMessage('Please fill in all fields before proceeding.');
      toggleModal();
    } else if (isNaN(Number(budgetValue)) || isNaN(Number(costvaxValue))) {
      setValidationMessage('Budget and Annual Cost of Vaccine must be numbers.');
      toggleModal();
    } else {
      toggleConfirmModal();
    }
  };

  const submitForm = () => {
    const submitUrl = `${apiURL}/submitBudgetForm`;
    const editUrl = `${apiURL}/editBudgetForm`;

    const formData = {
      year: selectedYear.getFullYear().toString(),
      budget: budgetValue,
      costvax: costvaxValue,
    };

    const isEditing = editableItem !== null;
    const apiUrl = isEditing ? editUrl : submitUrl;

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
      navigation.navigate('BudgetFormArchive', undefined, { pop: true });
    } else {
      navigation.navigate('VetInputForms', undefined, { pop: true });
    }
  };

  return (
    <FormScreen title="Budget Form">
      <AppDateField
        label="Period"
        mode="year"
        value={selectedYear}
        onPress={showDatePicker}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="year"
        date={new Date()}
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />

      <AppInput
        label="Annual Budget"
        placeholder="0"
        value={budgetValue}
        onChangeText={handleBudgetChange}
        keyboardType="numeric"
      />

      <AppInput
        label="Annual Cost of Vaccine"
        placeholder="Annual Cost of Vaccine"
        value={costvaxValue}
        onChangeText={handleCostvaxChange}
        keyboardType="numeric"
      />

      <View style={menuStyles.formActionsRow}>
        <AppButton title="Back" variant="secondary" onPress={handleBackPress} style={menuStyles.rowButton} />
        <AppButton title="Submit" variant="primary" onPress={handleSubmitPress} loading={isSubmitting} style={menuStyles.rowButton} />
      </View>

      <AppModal
        isVisible={isModalVisible}
        message={validationMessage}
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

export default BudgetForm;
