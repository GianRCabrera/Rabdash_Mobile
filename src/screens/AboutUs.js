import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AboutUs = () => {
  const navigation = useNavigation();

  const handleMainMenuNavigation = () => {
    navigation.navigate('MainMenu');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.box}>
        <Text style={styles.header}>Welcome to RabDash: A rabies forecasting dashboard.</Text>
      </View>
      <Text style={styles.subheader}>About the Project</Text>
      <Text style={styles.content}>
        Leveraging data and research to assist in achieving a rabies-free Davao
        City by 2030, the RabDash DC project aims to establish a rabies data
        analytics dashboard and integrate predictive models and genome
        informatics to support and optimize local rabies control programs. The
        project, which began on September 1, 2022, is funded by the Department of Science and
        Technology - Philippine Council for Health Research and
        Development and implemented by the University of the Philippines
        Mindanao.
      </Text>
      <Text style={styles.content}>
        The RabDash DC project, in collaboration with the City Veterinarian’s
        Office and the Philippine Genome Center Mindanao, is made possible
        following the milestones of its predecessors: STOP Rabies (2018-2020)
        and RabCast (2021-2022). The project’s research endeavors are an
        interdisciplinary collaboration among experts from the fields of
        biomathematics, economics, human health science, and veterinary
        medicine.
      </Text>
      <View style={styles.imageContainer}>
        <Image
          source={require('./assets/pchrd.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Image
          source={require('./assets/UPMIN.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.imageContainer}>
        <Image
          source={require('./assets/cvo.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Image
          source={require('./assets/stoprabies.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.imageContainer}>
        <Image
          source={require('./assets/pgc.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Image
          source={require('./assets/pawsitivity1.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleMainMenuNavigation}
      >
        <Text style={styles.buttonText}>Main Menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#E74A3B',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  box: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginTop: 80
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E74A3B',
    textAlign: 'center',
  },
  subheader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    color: 'white',
    textAlign: 'left',
  },
  content: {
    fontSize: 18,
    marginTop: 5,
    marginBottom: 20,
    color: 'white',
    textAlign: 'justify',
    lineHeight: 24,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: 100,
    height: 100,
  },
  button: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#E74A3B',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AboutUs;
