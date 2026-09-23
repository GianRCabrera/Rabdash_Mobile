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

const SEXES = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

const BITE_TYPES = [
  { label: 'B', value: 'B' },
  { label: 'NB', value: 'NB' },
];

const Rabies_Exposure_Form = () => {
  const [user, setUser] = useState(null);
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null);

  const [regNoValue, setRegNoValue] = useState('');

  const [isDateTimePickerVisible, setDateTimePickerVisibility] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const [nameValue, setNameValue] = useState('');
  const [addressValue, setAddressValue] = useState('');
  const [ageValue, setAgeValue] = useState('');

  const [isSexOpen, setIsSexOpen] = useState(false);
  const [sexValue, setSexValue] = useState(null);

  const [isDateTimePickerVisible2, setDateTimePickerVisibility2] = useState(false);
  const [selectedDateTime2, setSelectedDateTime2] = useState(null);

  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [typeValue, setTypeValue] = useState(null);

  const [typeAnimalValue, setTypeAnimalValue] = useState('');
  const [placeValue, setPlaceValue] = useState('');
  const [siteValue, setSiteValue] = useState('');

  const [isModalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const showDateTimePicker = () => setDateTimePickerVisibility(true);
  const hideDateTimePicker = () => setDateTimePickerVisibility(false);

  const handleDateTimeConfirm = (datetime) => {
    hideDateTimePicker();
    setSelectedDateTime(datetime);
  };

  const showDateTimePicker2 = () => setDateTimePickerVisibility2(true);
  const hideDateTimePicker2 = () => setDateTimePickerVisibility2(false);

  const handleDateTimeConfirm2 = (datetime2) => {
    hideDateTimePicker2();
    setSelectedDateTime2(datetime2);
  };

  const handleSexOpen = () => {
    setIsSexOpen(!isSexOpen);
    setIsTypeOpen(false);
  };

  const handleTypeOpen = () => {
    setIsTypeOpen(!isTypeOpen);
    setIsSexOpen(false);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }
    date.setHours(date.getHours() - 4);
    return date;
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
      setRegNoValue(item.regNo.toString() || '');
      setSelectedDateTime(formatDateTime(item.regDate));
      setNameValue(item.name);
      setAddressValue(item.address);
      setAgeValue(item.age.toString() || '');
      setSexValue(item.sex);
      setSelectedDateTime2(formatDateTime(item.expDate));
      setPlaceValue(item.place);
      setTypeAnimalValue(item.typeAnimal);
      setTypeValue(item.typeBNB);
      setSiteValue(item.site);
    }

    if (route.params?.fromArchive && route.params?.item) {
      setEditableItem(route.params.item);
    }
  }, [route.params]);

  const handleNextPress = () => {
    if (
      regNoValue === '' ||
      selectedDateTime === null ||
      nameValue === '' ||
      addressValue === '' ||
      ageValue === '' ||
      sexValue === null ||
      selectedDateTime2 === null ||
      placeValue === '' ||
      typeAnimalValue === '' ||
      typeValue === null ||
      siteValue === ''
    ) {
      toggleModal();
    } else if (editableItem) {
      const formData = {
        id: editableItem ? editableItem.id : null,
        regNo: regNoValue,
        regDate: selectedDateTime.toISOString(),
        name: nameValue,
        address: addressValue,
        age: ageValue,
        sex: sexValue,
        expDate: selectedDateTime2.toISOString(),
        place: placeValue,
        typeAnimal: typeAnimalValue,
        typeBNB: typeValue,
        site: siteValue,
      };
      navigation.navigate('Rabies_Exposure_Form2', {
        formData,
        petData: editableItem,
        fromArchive: !!editableItem,
      });
    } else {
      navigation.navigate('Rabies_Exposure_Form2', {
        regNo: regNoValue,
        regDate: selectedDateTime.toISOString(),
        name: nameValue,
        address: addressValue,
        age: ageValue,
        sex: sexValue,
        expDate: selectedDateTime2.toISOString(),
        place: placeValue,
        typeAnimal: typeAnimalValue,
        typeBNB: typeValue,
        site: siteValue,
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
    <FormScreen title="Rabies Exposure Form">
      <FormSectionLabel title="Registration" first />
      <AppInput label="No." placeholder="" value={regNoValue} onChangeText={setRegNoValue} />
      <AppDateField label="Date" mode="datetime" value={selectedDateTime} onPress={showDateTimePicker} />
      <DateTimePickerModal
        isVisible={isDateTimePickerVisible}
        mode="datetime"
        onConfirm={handleDateTimeConfirm}
        onCancel={hideDateTimePicker}
      />
      <AppInput label="Name of Patient" placeholder="" value={nameValue} onChangeText={setNameValue} />
      <AppInput label="Address" placeholder="" value={addressValue} onChangeText={setAddressValue} />

      <FormSectionLabel title="History of Exposure" />
      <View style={[menuStyles.row, isSexOpen && { zIndex: 20 }]}>
        <View style={menuStyles.rowButton}>
          <AppInput label="Age" placeholder="" value={ageValue} onChangeText={setAgeValue} />
        </View>
        <View style={menuStyles.rowButton}>
          <AppDropdown
            label="Sex"
            open={isSexOpen}
            value={sexValue}
            items={SEXES}
            setOpen={handleSexOpen}
            setValue={setSexValue}
            placeholder="Select sex"
          />
        </View>
      </View>

      <AppDateField label="Date" mode="datetime" value={selectedDateTime2} onPress={showDateTimePicker2} />
      <DateTimePickerModal
        isVisible={isDateTimePickerVisible2}
        mode="datetime"
        onConfirm={handleDateTimeConfirm2}
        onCancel={hideDateTimePicker2}
      />
      <AppInput label="Place (Where the biting occurred)" placeholder="" value={placeValue} onChangeText={setPlaceValue} />

      <View style={[menuStyles.row, isTypeOpen && { zIndex: 20 }]}>
        <View style={menuStyles.rowButton}>
          <AppInput label="Type of Animal" placeholder="" value={typeAnimalValue} onChangeText={setTypeAnimalValue} />
        </View>
        <View style={menuStyles.rowButton}>
          <AppDropdown
            label="Type (B/NB)"
            open={isTypeOpen}
            value={typeValue}
            items={BITE_TYPES}
            setOpen={handleTypeOpen}
            setValue={setTypeValue}
            placeholder="Select type"
          />
        </View>
      </View>
      <AppInput label="Site (Body parts)" placeholder="" value={siteValue} onChangeText={setSiteValue} />

      <View style={menuStyles.formActionsRow}>
        <AppButton title="Back" variant="secondary" onPress={handleBackPress} style={menuStyles.rowButton} />
        <AppButton title="Next" variant="primary" onPress={handleNextPress} style={menuStyles.rowButton} />
      </View>

      <AppModal
        isVisible={isModalVisible}
        message="Please fill in all fields before proceeding."
        onBackdropPress={toggleModal}
        actions={[{ label: 'OK', onPress: toggleModal }]}
      />
    </FormScreen>
  );
};

export default Rabies_Exposure_Form;
