import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
    },
    
    backgroundImage: {
      position: 'absolute',
      width: '200%',
      height: '100%',
      opacity: 0.15, // Corrected opacity to a valid value (less than or equal to 1)
      top: '-39%', // Moves the image up by 10% of the container's height
      right: '-100%', // Moves the image to the right by 10% of the container's width
    },
    PrivbackgroundImage: {
      position: 'absolute',
      width: '200%',
      height: '100%',
      opacity: 0.40, // Corrected opacity to a valid value (less than or equal to 1)
      top: '-10%', // Moves the image up by 10% of the container's height
      right: '-40%', // Moves the image to the right by 10% of the container's width
    }, 
    contentContainer: {
      backgroundColor: '#E74A3B', // Orange background for the inner container
      paddingTop: 100, // Reduced top padding to push children slightly lower
      paddingBottom: 20, // Balance padding at the bottom
      paddingHorizontal: 20, // Horizontal padding remains the same
      borderRadius: 45,
      width: '100%', // Adjust width as needed
      height: '85%',
      alignItems: 'center',
      justifyContent: 'flex-start', // Aligns children at the start of the container vertically
      marginTop: 60
  },
    header: {
      fontSize: 28,
      fontWeight: 'bold',
      marginTop: 150,
      color: '#E74A3B',
    },
    button: {
      backgroundColor: 'white',
      width: '75%',
      height: 40,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 25,
    },
    buttonText: {
      color: '#E74A3B',
      fontSize: 16,
      fontWeight: 'bold',
    },
    Logoutbutton: {
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 10,
      width: '40%',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      position: 'absolute',  // Positioning the button absolutely within the container
      right: 110,  // Align to the right side of the container
      bottom: 150,    // Positioned slightly from the top to avoid overlapping the container's edge
      marginTop: 500,
    },
    LogoutbuttonText: {
      color: '#E74A3B',
      fontSize: 18,
      fontWeight: 'bold',
    }
  });

export default styles;
