import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E74A3B',
      },
      whiteContainer: {
        backgroundColor: 'white',
        flex: 10,
        width: '95%', // Take the full width
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20, // Adjust the padding as needed
        borderBottomWidth: 30, // Add borderBottomWidth to create a border at the bottom
        borderBottomColor: 'white', // Specify the color of the border
        borderRadius: 15,
        marginBottom: 25,
      },
      greenContainer: {
        backgroundColor: 'green',
        width: '90%',
        padding: 10,
        borderRadius: 8,
        position: 'absolute',
        top: 15,
        alignItems: 'left',
      },
      greenText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
      },
      labelContainer: {
        width: '110%', // Adjust the width to take the full space
        marginBottom: 10,
      },
      labelText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color:'#1a202c',
        textAlign: 'left',
      },
      rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '95%',
        marginTop: 80,
      },
      rowContainer2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '95%',
        marginTop: 10,
      },
      dropdownContainer: {
        width: '95%',
        marginBottom: 10,
      },
      header: {
        fontSize: 19,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 20,
        color: 'white',
      },
      headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color:'#4a5568',
        textAlign: 'left',
      },
      textBox: {
        backgroundColor: '#F2F2F2',
        width: '90%',
        height: 40,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginTop: 5,
      }, 
      button: {
        backgroundColor: '#E74A3B',
        width: 150,
        height: 40,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 150,
      },
      buttonText: {
        color: 'white',
        fontSize: 16,
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
      modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '50%',
        marginTop: 10,
      },
});

export default styles;
