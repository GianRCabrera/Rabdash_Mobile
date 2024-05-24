import React, { useEffect } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './AuthContext';
import { Linking } from 'react-native'; // Correctly import Linking from react-native
import queryString from 'query-string'; // Import query-string for URL parsing

// Screens
import LoginPage from './LoginPage';
import MainMenu from './MainMenu';
import VetMenu from './VetMenu';
import ForgotPassword from './ForgotPassword';
import ResetPasswordPage from './ResetPasswordPage';
import OTP from './OTP';
import OTPRegistration from './OTPRegistration';
import ResetforgotPass from './ResetforgotPass'; // Correct path

import RegisterPage from './RegisterPage';
import AboutUs from './AboutUs';
import UserProfile from './UserProfile';
import InputForms from './InputForms';
import VetInputForms from './VetInputForms';
import RabiesFieldVaccForm from './Rabies_Field_Vacc_Form';
import RabiesFieldVaccForm2 from './Rabies_Field_Vacc_Form2';
import NeuterForm from './Neuter_Form';
import NeuterForm2 from './Neuter_Form2';
import RabiesSampleInformationForm from './Rabies_Sample_Information_Form';
import RabiesSampleInformationForm2 from './Rabies_Sample_Information_Form2';
import BudgetForm from './BudgetForm';
import WeatherForm from './WeatherForm';
import ScheduleForm from './ScheduleForm';
import IECForm from './IECForm';
import AnimalControlForm from './AnimalControlForm';
import Rabies_Exposure_Form1 from './Rabies_Exposure_Form1';
import Rabies_Exposure_Form2 from './Rabies_Exposure_Form2';
import ClientDatabase from './ClientDatabase';
import Field_vacc_archives from './Field_vacc_archives';
import Neuter_Form_archive from './Neuter_Form_archive';
import Sample_form_archive from './Sample_form_archive';
import VetArchiveMenu from './VetArchiveMenu';
import AnimalControlArchives from './AnimalControlArchives';
import IECFormArchive from './IECFormArchive';
import ScheduleFormArchive from './ScheduleFormArchive';
import BudgetFormArchive from './BudgetFormArchive';
import Rabies_Exposure_Form_Archive from './Rabies_Exposure_Form_Archive';
import WeatherFormArchive from './WeatherFormArchive';
import DownloadableForms from './DownloadableForms';
import DownloadableFormsPrivVet from './DownloadableFormsPrivVet';
import Landing_page from './Landing_page';

type RootStackParamList = {
  Landing_page: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  MainMenu: undefined;
  VetMenu: undefined;
  ResetPasswordPage: { email: string };
  Register: undefined;
  AboutUs: undefined;
  UserProfile: undefined;
  InputForms: undefined;
  VetInputForms: undefined;
  Rabies_Field_Vacc_Form: undefined;
  Rabies_Field_Vacc_Form2: undefined;
  Neuter_Form: undefined;
  Neuter_Form2: undefined;
  Rabies_Sample_Information_Form: undefined;
  Rabies_Sample_Information_Form2: undefined;
  ClientDatabase: undefined;
  BudgetForm: undefined;
  WeatherForm: undefined;
  ScheduleForm: undefined;
  IECForm: undefined;
  AnimalControlForm: undefined;
  Rabies_Exposure_Form1: undefined;
  Rabies_Exposure_Form2: undefined;
  Field_vacc_archives: undefined;
  Neuter_Form_archive: undefined;
  Sample_form_archive: undefined;
  VetArchiveMenu: undefined;
  AnimalControlArchives: undefined;
  IECFormArchive: undefined;
  ScheduleFormArchive: undefined;
  BudgetFormArchive: undefined;
  Rabies_Exposure_Form_Archive: undefined;
  WeatherFormArchive: undefined;
  DownloadableForms: undefined;
  DownloadableFormsPrivVet: undefined;
  OTP: undefined
  OTPRegistration: undefined
  ResetforgotPass: undefined

};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      const parsedUrl = queryString.parseUrl(url);

      if (parsedUrl.url.endsWith('reset-password') && parsedUrl.query.email) {
        navigationRef.current?.navigate('ResetPasswordPage', { email: parsedUrl.query.email as string });
      }
    };

    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      linkingSubscription.remove();
    };
  }, [navigationRef]);

  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Landing_page">
          <Stack.Screen name="Landing_page" component={Landing_page} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
          <Stack.Screen name="OTP" component={OTP} options={{ headerShown: false }} />
          <Stack.Screen name="OTPRegistration" component={OTPRegistration} options={{ headerShown: false }} />
          <Stack.Screen name="MainMenu" component={MainMenu} options={{ headerShown: false }} />
          <Stack.Screen name="VetMenu" component={VetMenu} options={{ headerShown: false }} />
          <Stack.Screen name="ResetPasswordPage" component={ResetPasswordPage} options={{ headerShown: false }} />
          <Stack.Screen name="ResetforgotPass" component={ResetforgotPass} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterPage} options={{ headerShown: false }} />
          <Stack.Screen name="AboutUs" component={AboutUs} options={{ headerShown: false }} />
          <Stack.Screen name="UserProfile" component={UserProfile} options={{ headerShown: false }} />
          <Stack.Screen name="InputForms" component={InputForms} options={{ headerShown: false }} />
          <Stack.Screen name="VetInputForms" component={VetInputForms} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Field_Vacc_Form" component={RabiesFieldVaccForm} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Field_Vacc_Form2" component={RabiesFieldVaccForm2} options={{ headerShown: false }} />
          <Stack.Screen name="Neuter_Form" component={NeuterForm} options={{ headerShown: false }} />
          <Stack.Screen name="Neuter_Form2" component={NeuterForm2} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Sample_Information_Form" component={RabiesSampleInformationForm} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Sample_Information_Form2" component={RabiesSampleInformationForm2} options={{ headerShown: false }} />
          <Stack.Screen name="ClientDatabase" component={ClientDatabase} options={{ headerShown: false }} />
          <Stack.Screen name="BudgetForm" component={BudgetForm} options={{ headerShown: false }} />
          <Stack.Screen name="WeatherForm" component={WeatherForm} options={{ headerShown: false }} />
          <Stack.Screen name="ScheduleForm" component={ScheduleForm} options={{ headerShown: false }} />
          <Stack.Screen name="IECForm" component={IECForm} options={{ headerShown: false }} />
          <Stack.Screen name="AnimalControlForm" component={AnimalControlForm} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Exposure_Form1" component={Rabies_Exposure_Form1} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Exposure_Form2" component={Rabies_Exposure_Form2} options={{ headerShown: false }} />
          <Stack.Screen name="Field_vacc_archives" component={Field_vacc_archives} options={{ headerShown: false }} />
          <Stack.Screen name="Neuter_Form_archive" component={Neuter_Form_archive} options={{ headerShown: false }} />
          <Stack.Screen name="Sample_form_archive" component={Sample_form_archive} options={{ headerShown: false }} />
          <Stack.Screen name="VetArchiveMenu" component={VetArchiveMenu} options={{ headerShown: false }} />
          <Stack.Screen name="AnimalControlArchives" component={AnimalControlArchives} options={{ headerShown: false }} />
          <Stack.Screen name="IECFormArchive" component={IECFormArchive} options={{ headerShown: false }} />
          <Stack.Screen name="ScheduleFormArchive" component={ScheduleFormArchive} options={{ headerShown: false }} />
          <Stack.Screen name="BudgetFormArchive" component={BudgetFormArchive} options={{ headerShown: false }} />
          <Stack.Screen name="WeatherFormArchive" component={WeatherFormArchive} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Exposure_Form_Archive" component={Rabies_Exposure_Form_Archive} options={{ headerShown: false }} />
          <Stack.Screen name="DownloadableForms" component={DownloadableForms} options={{ headerShown: false }} />
          <Stack.Screen name="DownloadableFormsPrivVet" component={DownloadableFormsPrivVet} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
