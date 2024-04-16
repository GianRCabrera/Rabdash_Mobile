import React, { useState, useEffect } from 'react';
import { View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Modal from 'react-native-modal';
import axios from 'axios';
import styles from './styles/submitforms3';

const WeatherForm = () => {
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const route = useRoute();
  const [editableItem, setEditableItem] = useState(null); // Add this line to handle editable item

  const [min_tempValue, setMin_tempValue] = useState('');
  const [max_tempValue, setMax_tempValue] = useState('');
  const [mean_tempValue, setMean_tempValue] = useState('');
  const [relative_humidValue, setRelative_humidValue] = useState('');
  const [rainfallValue, setRainfallValue] = useState('');
  const [precipitationValue, setPrecipitationValue] = useState('');

  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  const apiURL = process.env.EXPO_PUBLIC_URL;

  const toggleConfirmModal = () => {
    setConfirmModalVisible(!isConfirmModalVisible);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleMin_tempChange = (text) => {
    setMin_tempValue(text);
  };

  const handleMax_tempChange = (text) => {
    setMax_tempValue(text);
  };

  const handleMean_tempChange = (text) => {
    setMean_tempValue(text);
  };

  const handleRelative_humidChange = (text) => {
    setRelative_humidValue(text);
  };

  const handleRainfallChange = (text) => {
    setRainfallValue(text);
  };

  const handlePrecipitationChange = (text) => {
    setPrecipitationValue(text);
  };

useEffect(() => {
  // Conditional Autofill based on 'fromArchive' flag
  const { item, fromArchive } = route.params || {};
  if (fromArchive && item) {
    console.log("Editing item:", item); // Check the item's values

    // Autofill fields if coming from archives and in edit mode
    setMin_tempValue(item.minimum_temperature.toString());
    setMax_tempValue(item.maximum_temperature.toString());
    setMean_tempValue(item.mean_temperature.toString());
    setRelative_humidValue(item.relative_humidity.toString());
    setRainfallValue(item.rainfall.toString());
    setPrecipitationValue(item.precipitation.toString());
  } else {
    // Clear the fields if not in edit mode
    setMin_tempValue('');
    setMax_tempValue('');
    setMean_tempValue('');
    setRelative_humidValue('');
    setRainfallValue('');
    setPrecipitationValue('');
  }
  
  // Additional logic to handle editable item from archives
  if (route.params?.fromArchive && route.params?.item) {
    // Set editableItem state to the item passed from archives
    setEditableItem(route.params.item);
  }
}, [route.params]);

const handleBackPress = () => {
  const backTo = route.params?.from;
  switch (backTo) {
    case 'ArchiveMenu':
      navigation.navigate('ArchiveMenu');
      break;
    case 'VetInputForms':
      navigation.navigate('VetInputForms');
      break;
    default:
      navigation.goBack();
  }
};

  const handleSubmitPress = () => {
    // Check if all fields are filled
   if (
    min_tempValue === '' ||
    max_tempValue === '' ||
    mean_tempValue == '' ||
    relative_humidValue === '' ||
    rainfallValue === '' ||
    precipitationValue === ''
   ) {
     toggleModal();
   } else {
      // ... (existing code)
      toggleConfirmModal();
   }
 };

 const submitForm = () => {

  // Prepare the data for submission
  const formData = {
    minimum_temperature:min_tempValue,
    maximum_temperature:max_tempValue,
    mean_temperature:mean_tempValue,
    relative_humidity:relative_humidValue,
    rainfall:rainfallValue,
    precipitation:precipitationValue
  };

  // Check if editing (editableItem is not null) or creating new
  const isEditing = editableItem !== null;
  const apiUrl = isEditing ? `${apiURL}/editWeatherForm` : `${apiURL}/submitWeatherForm`;


  // If editing, include the ID in the formData
  if (isEditing) {
    formData.id = editableItem.id;
  }

   // Perform API call
   axios.post(apiUrl, formData)
   .then(response => {
       console.log(response.data);
       // Navigate back or refresh list as needed
       if (isEditing) {
         // Possibly navigate back or refresh the list to show updated data
         navigation.navigate('VetArchiveMenu'); // Adjust 'ArchiveMenu' to your actual Archive Menu screen name
       } else {
         // Handle navigation for new entry submission
         navigation.navigate('VetInputForms'); // Adjust 'FormMenu' to your actual Form Menu screen name
       }
   })
   .catch(error => {
       console.error('Error submitting form:', error);
   });
};

    return (
    <View style={styles.container}>
      <Text style={styles.header}>Weather Form</Text>

       {/* White Container */}
    <View style={styles.whiteContainer}>
    <ScrollView>
      <View style={styles.greenContainer}>
          <Text style={styles.greenText}>Input "N/A" if information is unavailable</Text>
      </View>

      {/* Container for Period */}
      <View style={styles.rowContainer}>
          {/* Date Container */}
          <View style={styles.labelContainer}>
          <Text style={[styles.labelText, { textAlign: 'left' }]}>Minimum Temperature</Text>
            <TextInput
              style={styles.textBox}
              placeholder=""
              value={min_tempValue}  // Set the value from the state
              onChangeText={handleMin_tempChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
            </View>
        </View>

        <View style={styles.rowContainer2}>
             {/* Budget Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Maximum Temperature</Text>
            <TextInput
              style={styles.textBox}
              placeholder=""
              value={max_tempValue}  // Set the value from the state
              onChangeText={handleMax_tempChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
            </View>
        </View>

        <View style={styles.rowContainer2}>
             {/* Budget Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Mean Temperature</Text>
            <TextInput
              style={styles.textBox}
              placeholder=""
              value={mean_tempValue}  // Set the value from the state
              onChangeText={handleMean_tempChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
            </View>
        </View>

        <View style={styles.rowContainer2}>
             {/* Budget Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Relative Humidity</Text>
            <TextInput
              style={styles.textBox}
              placeholder=""
              value={relative_humidValue}  // Set the value from the state
              onChangeText={handleRelative_humidChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
            </View>
        </View>

        <View style={styles.rowContainer2}>
             {/* Budget Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Rainfall</Text>
            <TextInput
              style={styles.textBox}
              placeholder=""
              value={rainfallValue}  // Set the value from the state
              onChangeText={handleRainfallChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
            </View>
        </View>

        <View style={styles.rowContainer2}>
             {/* Budget Container */}
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { textAlign: 'left' }]}>Precipitation</Text>
            <TextInput
              style={styles.textBox}
              placeholder=""
              value={precipitationValue}  // Set the value from the state
              onChangeText={handlePrecipitationChange}  // Handle text changes
              // Additional TextInput props can be added as needed
            />
            </View>
        </View>

      {/* Container for Back and Next Number */}
      <View style={styles.rowContainer2}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleBackPress}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmitPress}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
          {/* Modal to check if all fields are inputted */}
          <Modal isVisible={isModalVisible}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                Please fill in all fields before proceeding.
              </Text>
              <TouchableOpacity style={styles.modalButton}  onPress={toggleModal}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Modal isVisible={isConfirmModalVisible}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Are you sure of your answers?</Text>
              <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={submitForm}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={toggleConfirmModal}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
             </View>
            </View>
          </Modal>
        </ScrollView>
    </View>
  </View>
    );
};

export default WeatherForm;
