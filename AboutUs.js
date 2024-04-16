import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';

const AboutUs = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.box}>
        <Text style={styles.header}>Welcome to RabDash: A rabies forecasting dashboard.</Text>
      </View>
      <Text style={styles.subheader}>About the project</Text>
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
          source={require('./assets/pchrd.png')} // Replace with your image file path
          style={styles.image}
          resizeMode="contain" // Set resizeMode to "contain"
        />
        <Image
          source={require('./assets/UPMIN.png')} // Replace with your image file path
          style={styles.image}
          resizeMode="contain" // Set resizeMode to "contain"
        />
        </View>
      <View style={styles.imageContainer}>
        <Image
          source={require('./assets/cvo.png')} // Replace with your image file path
          style={styles.image}
          resizeMode="contain" // Set resizeMode to "contain"
        />
        <Image
          source={require('./assets/stoprabies.png')} // Replace with your image file path
          style={styles.image}
          resizeMode="contain" // Set resizeMode to "contain"
        />
      </View>
      <View style={styles.imageContainer}>
        <Image
          source={require('./assets/pgc.png')} // Replace with your image file path
          style={styles.image}
          resizeMode="contain"
        />
        <Image
          source={require('./assets/pawsitivity1.png')} // Replace with your image file path
          style={styles.image}
          resizeMode="contain" 
        />
      </View>
      <View style={{ height: 500 }} />
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
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
    color: '#E74A3B',
    textAlign: 'center',
  },
  subheader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: 'black',
    textAlign: 'left',
  },
  content: {
    fontSize: 18,
    marginTop: 5,
    marginBottom: 30,
    color: 'black',
    textAlign: 'justify',
  },
  imageContainer: {
    flexDirection: 'row', // Display images horizontally
    justifyContent: 'center', // Space them evenly
    alignItems: 'center', // Align them vertically
  },
  image: {
    width: 120,
    height: 120,
    marginTop: 20,
    marginBottom: 20,
    marginRight: 30,
    marginLeft: 30,
  },
});

export default AboutUs;


