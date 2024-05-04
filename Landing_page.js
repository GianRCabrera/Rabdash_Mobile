import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'; // Import Image from 'react-native'
import { useNavigation } from '@react-navigation/native';

const LandingPage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/Landing_page.png')} // Ensure the path is correct
        style={styles.image} // Custom styles for the image
      />
      <View style={styles.contentContainer}> 
        <Text style={styles.header}>Rabdash DC</Text>
        <Text style={styles.subheader}>
          Leveraging data and research to assist in achieving a rabies-free Davao City by 2030.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  contentContainer: {
    backgroundColor: '#E74A3B', // Orange background for the inner container
    padding: 20,
    borderRadius: 75,
    width: '120%', // Adjust width as needed
    height: '65%',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40, // Adjusted spacing for visual balance
    marginTop: 40, // Adjusted spacing for visual balance
  },
  subheader: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 40, // Add horizontal padding for better text alignment
    marginBottom: 10, // Space between subheader and buttons
  },
  image: {
    width: 350, // Increased width
    height: 300, // Increased height
    marginBottom: 50, // Space between image and header
    marginTop: 200, // Space between image and header

  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#E74A3B',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default LandingPage;