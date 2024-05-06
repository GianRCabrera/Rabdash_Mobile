import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    scrollViewContainer: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      backgroundColor: '#E74A3B',
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      alignItems: 'center',
      textAlign: 'center',
      justifyContent: 'center',
      marginTop: 80,
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    itemContainer: {
      padding: 10, // Add padding around items
    },
    divider: {
      height: 1,
      backgroundColor: '#ddd',
      marginVertical: 10, // Add a divider between items
    },
    button: {
      backgroundColor: 'white',
      width: '40%',
      alignSelf: 'center', // Center button horizontally
      height: 40,
      borderRadius: 5,
      marginHorizontal: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
    },
    buttonText: {
      color: '#E74A3B',
      fontSize: 16,
      fontWeight: 'bold',
    },
    buttonContainer:{
      flexDirection: 'row',
    },
    
    //Modal
    editButton: {
      backgroundColor: '#3498db', // A pleasant shade of blue
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20, // Rounded corners for a sleek look
      shadowColor: "#000",
      shadowOffset: {
      width: 0,
      height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
      marginTop: 10, // Provide some space above the button
      alignSelf: 'center', // Center button in its container
    },
   //Modal
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

  //SearchBar
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    margin: 10,
    backgroundColor: '#F0F0F0', // Light gray background
    fontSize: 16, // Text size
    marginTop: 20,
    marginBottom: 40
  },

  pageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, // Add some margin to separate from the buttons
    textAlign: 'center', // Center the text horizontally
  },
});

  export default styles;
