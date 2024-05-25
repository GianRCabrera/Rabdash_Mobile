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
    opacity: 0.15,
    top: '-39%',
    right: '-100%',
  },
  PrivbackgroundImage: {
    position: 'absolute',
    width: '200%',
    height: '100%',
    opacity: 0.40,
    top: '-10%',
    right: '-40%',
  },
  contentContainer: {
    backgroundColor: '#E74A3B',
    paddingTop: 80,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 45,
    width: '100%',
    height: '85%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 210,
    color: '#E74A3B',
  },
  positionLabelContainer: {
    position: 'absolute',
    top: 40, // Adjust as needed
    right: 20, // Adjust as needed
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
  },
  positionLabel: {
    color: '#E74A3B',
    fontSize: 14,
    fontWeight: 'bold',
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
    position: 'absolute',
    right: 130,
    bottom: 150,
    marginTop: 500,
  },
  LogoutbuttonText: {
    color: '#E74A3B',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default styles;
