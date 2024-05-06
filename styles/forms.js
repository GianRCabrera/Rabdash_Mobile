 /* styles.js */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E74A3B',
    padding: 20,

  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    marginTop: 80,
    marginBottom: 30,
    paddingHorizontal: 20, // Add horizontal padding for better text alignment
    
  },
  whiteContainer: {
    backgroundColor: 'white',
    flex: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderBottomWidth: 30,
    borderBottomColor: 'white',
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
    width: '50%',
    marginBottom: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 100,
  },
  rowContainer2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    marginTop: 10,
  },
  dropdownContainer: {
    width: '48%',
    marginBottom: 10,
    maxHeight: 150, // Set a fixed height for dropdown to make it scrollable
  },
  labelText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a202c',
    textAlign: 'left',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#4a5568',
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
    width: '48%',
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
});

export default styles;
