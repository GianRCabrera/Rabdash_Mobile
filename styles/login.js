import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E74A3B',
    },
    image: {
      width: 200,
      height: 200,
      marginTop: 20, // Move the image 50 units higher
      marginBottom: 50,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: -20, // Move the image 50 units higher
      marginBottom: 20,
      color: 'white',
    },
    input: {
      width: '80%',
      height: 40,
      borderColor: 'gray',
      borderWidth: 0,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 10,
      backgroundColor: 'white',
    },

    passwordInputContainer: {
      flexDirection: 'row',
      width: '80%',
      height: 40,
      marginBottom: 10,
      borderColor: 'gray',
      borderWidth: 1, 
      borderRadius: 5,
      backgroundColor: 'white',
      paddingHorizontal: 10,
      justifyContent: 'space-between', // Align items with space between
      alignItems: 'center', // Align items in the center
    },

    visibilityButton: {
      padding: 8,

    },
    visibilityButtonText: {
      color: "white",  // Set the text color to a lighter grey if needed
    },

  
    button: {
      backgroundColor: 'white',
      width: '80%',
      height: 40,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: '#E74A3B',
      fontSize: 16,
      fontWeight: 'bold',
    },
    separator: {
      width: '80%',
      height: 1,
      backgroundColor: 'white',
      marginVertical: 10,
    },
    forgotPasswordLink: {
      marginTop: 10,
    },
    forgotPasswordText: {
      color: 'white',
      fontSize: 14,
    },
    registerLink: {
      marginTop: 7,
    },
    registerText: {
      color: 'white',
      fontSize: 16,
    },
    modalContainer: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalText: {
      fontSize: 18,
      marginBottom: 10,
      textAlign: 'center',
    },
    modalButton: {
      backgroundColor: '#E74A3B',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 5,
    },
    modalButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  export default styles;
