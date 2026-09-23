import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import {
  AppButton,
  AppInput,
  AppDropdown,
  AppModal,
  FormScreen,
  FormSectionLabel,
  menuStyles,
} from '../components';

const SPECIES = [
  { label: 'Canine', value: 'Canine' },
  { label: 'Feline', value: 'Feline' },
];

const SEXES = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

const Neuter_Form2 = () => {
  const [user, setUser] = useState(null);
  const route = useRoute();

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');

  const [age, setAge] = useState('');
  const [pets, setPets] = useState('');
  const [cat, setCat] = useState('');

  const [isSpeciesOpen, setIsSpeciesOpen] = useState(false);
  const [speciesValue, setSpeciesValue] = useState(null);

  const [isSexOpen, setIsSexOpen] = useState(false);
  const [sexValue, setSexValue] = useState(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isUpdateSuccessModalVisible, setUpdateSuccessModalVisible] = useState(false);

  const isEdit = route.params?.formData?.id ? true : false;

  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL;

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleSpeciesOpen = () => {
    setIsSpeciesOpen(!isSpeciesOpen);
    setIsSexOpen(false);
  };

  const handleSexOpen = () => {
    setIsSexOpen(!isSexOpen);
    setIsSpeciesOpen(false);
  };

  useEffect(() => {
    axios.get(`${apiURL}/Position`)
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Error fetching position:', error);
      });

    const { petData } = route.params || {};

    if (petData) {
      setName(petData.name || '');
      setSpeciesValue(petData.species || null);
      setSexValue(petData.sex || null);
      setBreed(petData.breed || '');
      setAge(petData.age || '');
      setPets(petData.pets !== undefined ? petData.pets.toString() : '');
      setCat(petData.cat !== undefined ? petData.cat.toString() : '');
    }
  }, [route.params]);

  const handleSubmitPress = () => {
    if (!name || !speciesValue || !sexValue || !breed || !age || !pets || !cat) {
      setModalVisible(true);
    } else {
      setConfirmModalVisible(true);
    }
  };

  const submitForm = () => {
    const formData = route.params?.formData || {};
    const isEditing = Boolean(formData?.id);

    let submissionData = {};

    if (isEditing) {
      submissionData = {
        id: formData.id,
        date: formData.date,
        district: formData.district,
        barangay: formData.barangay,
        purok: formData.purok,
        proc: formData.proc,
        client: formData.client,
        address: formData.address,
        contactNo: formData.contactNo,
        name,
        species: speciesValue,
        sex: sexValue,
        breed,
        age,
        pets: pets.toString(),
        cat: cat.toString(),
      };
    } else {
      submissionData = {
        date: route.params?.date,
        district: route.params?.district,
        barangay: route.params?.barangay,
        purok: route.params?.purok,
        proc: route.params?.proc,
        client: route.params?.client,
        address: route.params?.address,
        contactNo: route.params?.contactNo,
        name,
        species: speciesValue,
        sex: sexValue,
        breed,
        age,
        pets: pets.toString(),
        cat: cat.toString(),
      };
    }

    const endpoint = isEditing ? `${apiURL}/editNeuterForm` : `${apiURL}/submitNeuterForm`;

    axios.post(endpoint, submissionData)
      .then(response => {
        if (response.data.success) {
          if (isEditing) {
            setUpdateSuccessModalVisible(true);
          } else {
            setSuccessModalVisible(true);
          }
        }
      })
      .catch(error => {
        console.error('Error submitting Neuter form:', error);
      });
  };

  const navigateAfterSubmit = () => {
    const position = user.position;
    if (isEdit) {
      navigation.navigate('Neuter_Form_archive');
    } else if (position === 'CVO' || position === 'RabDash') {
      navigation.navigate('VetInputForms');
    } else if (position === 'Private Veterinarian') {
      navigation.navigate('InputForms');
    } else {
      console.warn('Unknown user position:', position);
    }
  };

  return (
    <FormScreen title="Neuter Form (Part 2)">
      <FormSectionLabel title="Pet Owner" first />
      <AppInput label="Patient's Name" placeholder="Name" value={name} onChangeText={setName} />

      <AppDropdown
        label="Species"
        open={isSpeciesOpen}
        value={speciesValue}
        items={SPECIES}
        setOpen={handleSpeciesOpen}
        setValue={setSpeciesValue}
        placeholder="Select species"
      />
      <AppDropdown
        label="Sex"
        open={isSexOpen}
        value={sexValue}
        items={SEXES}
        setOpen={handleSexOpen}
        setValue={setSexValue}
        placeholder="Select sex"
      />
      <AppInput label="Breed" placeholder="Breed" value={breed} onChangeText={setBreed} />
      <AppInput label="Age" placeholder="8 months old" value={age} onChangeText={setAge} />

      <AppInput
        label="No. of Dog (Household)"
        placeholder="8"
        value={pets}
        onChangeText={setPets}
        keyboardType="numeric"
      />
      <AppInput
        label="No. of Cat (Household)"
        placeholder="0"
        value={cat}
        onChangeText={setCat}
        keyboardType="numeric"
      />

      <View style={menuStyles.formActionsRow}>
        <AppButton title="Back" variant="secondary" onPress={() => navigation.navigate('Neuter_Form')} style={menuStyles.rowButton} />
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

export default Neuter_Form2;
