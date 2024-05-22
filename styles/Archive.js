import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#E74A3B',
    alignItems: 'center', // Center children horizontally
    justifyContent: 'flex-start', // Align children to the top
    paddingTop: 60, // Padding at the top for some spacing
  },
  headerContainer: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20, // Adjust the margin to give space below the header
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#E74A3B',
    textAlign: 'center',
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
  itemContainer: {
    backgroundColor: 'white', // Set background color for visibility
    padding: 10,
    borderRadius: 20, // Rounded corners for an oblong shape
    marginHorizontal: 10, // Reduced for wider appearance
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4, // Elevation for Android
    flexDirection: 'column', // Stack the content vertically
    width: '95%', // Making container wider
    alignSelf: 'center', // Ensure it's centered in the parent view
  },
  itemText: { // Style for labels
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  itemDataText: { // Style for data values
    fontWeight: 'normal',
    fontSize: 16,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Ensures even spacing between buttons
    marginTop: 10, // Space above the button row
    width: '100%', // Use full width of the item container
    marginBottom: -10, // Reduced space between the buttons and the page text
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1, // Flex to fill available space evenly
    margin: 5, // Margin around the button for spacing
    justifyContent: 'center', // Center text vertically
    alignItems: 'center', // Center text horizontally
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1, // Flex to fill available space evenly
    margin: 5, // Margin around the button for spacing
    justifyContent: 'center', // Center text vertically
    alignItems: 'center', // Center text horizontally
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 20,
    width: '90%', // Match the width of the header container
    marginBottom: 20, // Margin bottom for spacing
  },
  searchBar: {
    flex: 1,
    paddingLeft: 10,
    height: 40, // Standardize height for better UI
    fontSize: 16,
    color: '#000',
  },
  searchIcon: {
    marginRight: 10,
  },
  pageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20, // Reduced margin to separate from the buttons
    textAlign: 'center', // Center the text horizontally
  },
});

export default styles;
