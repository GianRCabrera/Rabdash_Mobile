import React, { useEffect,useState } from 'react';
import { 
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker'; // Add this import
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Modal from 'react-native-modal';
import axios from 'axios';
import styles from './styles/forms';

const Rabies_Sample_Information_Form = () => {

    const [user, setUser] = useState(null);
    const route = useRoute();
    const [editableItem, setEditableItem] = useState(null); // Add this line to handle editable item

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
      // Do something with the selected date (e.g., update state)
      setSelectedDate(date);
    };  

    const handleDistrictOpen = () => {
        setIsDistrictOpen(!isDistrictOpen);
        setIsSexOpen(false);
        setIsSpeciesOpen(false)
    };

    const handleSexOpen = () => {
        setIsSexOpen(!isSexOpen);
        setIsDistrictOpen(false);
        setIsSpeciesOpen(false)
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

  //const NETWORK_URL = 'http://192.168.1.211:3000/Position';
  //const NETWORK_URL = 'http://192.168.1.7:3000/Position';

  useEffect(() => {
    // Fetch user profile data from the backend
    axios.get(`${apiURL}/Position`)
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Error fetching position:', error);
        // Handle error, e.g., navigate to login screen
      });

    // Conditional Autofill based on 'fromArchive' flag
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

    // Additional logic to handle editable item from archives
    if (fromArchive && item) {
      // Set editableItem state to the item passed from archives
      setEditableItem(item);
    }
  }, [route.params]);
  
  const handleNextPress = () => {
    // Check if all fields are filled
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
      // Determine if it's a new entry or an edit based on editableItem
      if(editableItem){
        const formData = {
          id: editableItem ? editableItem.id : null, // Include the ID from editableItem
          name,
          sex:sexValue,
          address: address,
          number,
          district: districtValue,
          barangay: barangay,
          date: selectedDate.toISOString(),
          species:speciesValue,
          breed,
          age
        };
        navigation.navigate('Rabies_Sample_Information_Form2', {
          formData,
          petData: editableItem, // Pass along pet-related data from archives if editing
          fromArchive: !!editableItem,
        });
      } else {
          // New entry: Pass along the filled data without petData
          navigation.navigate('Rabies_Sample_Information_Form2', {
            name,
            sex:sexValue,
            address,
            number,
            district:districtValue,
            barangay,
            date:selectedDate,
            species:speciesValue,
            breed,
            age,
     
           // No need to pass petData for a new entry
           fromArchive: false, // Indicate this is not from archives/edit mode
          });
        }
      }
    };

    const handleBackPress = () => {
      const source = route.params?.source;
      switch (source) {
        case 'Sample_form_archives':
          navigation.navigate('Sample_form_archives'); // Replace 'ArchiveScreen' with your actual archive screen name
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
      <Text style={styles.header}>Rabies Sample Information</Text>

       {/* White Container */}
    <View style={styles.whiteContainer}>
      <ScrollView
      contentContainerStyle={styles.scrollViewContainer} 
      nestedScrollEnabled={true} // Enable this on Android
      >
      <View style={styles.greenContainer}>
          <Text style={styles.greenText}>Input "N/A" if information is unavailable</Text>
      </View>

      {/* Container for Owner's Profile */}
      <View style={styles.rowContainer}>
        <Text style={styles.headerText}>Owner's Profile</Text>
      </View>

      {/* Container for Name and Sex */}
      <View style={styles.rowContainer2}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Name</Text>
            <TextInput
              style={styles.textBox}
              placeholder="Name"
              value={name}  // Set the value from the state
              onChangeText={handleNameChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>

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
                  listMode="SCROLLVIEW" // Ensure the internal list is a ScrollView
                />
          </View>
      </View>

      {/* Container for Address and Contact Number */}
      <View style={styles.rowContainer2}>
          <View style={styles.dropdownContainer}>
              <Text style={styles.labelText}>Address</Text>
              <TextInput
              style={styles.textBox}
              placeholder="Complete Address"
              value={address}  // Set the value from the state
              onChangeText={handleAddressChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>

          <View style={styles.dropdownContainer}>
            <Text style={styles.labelText}>Contact Number</Text>
            <TextInput
              style={styles.textBox}
              placeholder="09123456789"
              value={number}  // Set the value from the state
              onChangeText={handleNumberChange}  // Handle text changes
              keyboardType="numeric"  // Set keyboard to numeric
              maxLength={11}  // Set maximum length to 11
            />
          </View>
      </View>

      {/* Container for District and Barangay*/}
      <View style={styles.rowContainer2}>
           {/* District Container */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.labelText}>District:</Text>
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
              listMode="SCROLLVIEW" // Ensure the internal list is a ScrollView
            />
          </View>

          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Barangay</Text>
            <TextInput
              style={styles.textBox}
              placeholder=" "
              value={barangay}  // Set the value from the state
              onChangeText={handleBarangayChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>
      </View>

      {/* Container for Sample's Profile */}
      <View style={styles.rowContainer2}>
        <Text style={styles.headerText}>Sample's Profile</Text>
      </View>

      {/* Container for Vaccine Used/Lot Number and Source of Vaccine */}
      <View style={styles.rowContainer2}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Date </Text>
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
              listMode="SCROLLVIEW" // Ensure the internal list is a ScrollView
              />
          </View>
      </View>

      {/* Container for Breed and Age */}
      <View style={styles.rowContainer2}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Breed </Text>
            <TextInput
              style={styles.textBox}
              placeholder="Azkal"
              value={breed}  // Set the value from the state
              onChangeText={handleBreedChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>

          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Age </Text>
            <TextInput
              style={styles.textBox}
              placeholder="8 months old"
              value={age}  // Set the value from the state
              onChangeText={handleAgeChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
          </View>
      </View>

      {/* Container for Back and Next Number */}
      <View style={styles.rowContainer2}>
          {/* Back Button */}
          <TouchableOpacity
          style={styles.button}
          onPress={handleBackPress}  // Call the function directly
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleNextPress}  // Add this line
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
        {/* Modal to check if all fields are inputted and Modal to display error message */}
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