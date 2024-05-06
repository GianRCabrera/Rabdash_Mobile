import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
      },
      backgroundImage: {
        position: 'absolute',
        width: '200%',
        height: '100%',
        opacity: 0.2, // Corrected opacity to a valid value (less than or equal to 1)
        top: '-35%', // Moves the image up by 10% of the container's height
        right: '-60%', // Moves the image to the right by 10% of the container's width
      },
      DLbackgroundImage: {
        position: 'absolute',
        width: '200%',
        height: '100%',
        opacity: 0.2, // Corrected opacity to a valid value (less than or equal to 1)
        top: '-50%', // Moves the image up by 10% of the container's height
        right: '-20%', // Moves the image to the right by 10% of the container's width
      },
      contentContainer: {
        backgroundColor: '#E74A3B', // Orange background for the inner container
        paddingTop: 50, // Reduced top padding to push children slightly lower
        paddingBottom: 20, // Balance padding at the bottom
        paddingHorizontal: 20, // Horizontal padding remains the same
        borderRadius: 85,
        width: '120%', // Adjust width as needed
        height: '85%',
        alignItems: 'center',
        justifyContent: 'flex-start', // Aligns children at the start of the container vertically
       // marginTop: 60
    },
      header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E74A3B',
        marginBottom: 60, // Adjusted spacing for visual balance
        marginTop: 140, // Adjusted spacing for visual balance
    },
      buttonContainer: {
        flexDirection: 'row',
      },
      button: {
        backgroundColor: 'white',
        width: '45%',
        height: 80,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        borderRadius: 7,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 15,
      },
      Privbutton: {
        backgroundColor: 'white',
        width: '80%',
        height: 80,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 15,
      },
      buttonText: {
        color: '#E74A3B',
        fontSize: 16,
        fontWeight: 'bold',
      },
      Menubutton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        width: '40%',
        marginTop: 10,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 20,
        position: 'absolute',  // Positioning the button absolutely within the container
        right: 120,  // Align to the right side of the container
        bottom: 80,    // Positioned slightly from the top to avoid overlapping the container's edge
        marginTop: 500,
      },
      PrivMenubutton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        width: '40%',
        marginTop: 10,
        alignItems: 'center',
        paddingHorizontal: 20,
        marginHorizontal: 5,
        borderRadius: 20,
        position: 'absolute',  // Positioning the button absolutely within the container
        right: 120,  // Align to the right side of the container
        bottom: 130,    // Positioned slightly from the top to avoid overlapping the container's edge
      },
      MenubuttonText: {
        color: '#E74A3B',
        fontSize: 18,
        fontWeight: 'bold',
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
