import React, { useEffect } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import { Linking } from 'react-native'; // Correctly import Linking from react-native
import queryString from 'query-string'; // Import query-string for URL parsing
import './src/api/axiosSessionInterceptor'; // Side-effect import: registers the global 401 handler once

// Screens
import LoginPage from './src/screens/LoginPage';
import MainMenu from './src/screens/MainMenu';
import VetMenu from './src/screens/VetMenu';
import ForgotPassword from './src/screens/ForgotPassword';
import ResetPasswordPage from './src/screens/ResetPasswordPage';
import OTP from './src/screens/OTP';
import OTPRegistration from './src/screens/OTPRegistration';
import ResetforgotPass from './src/screens/ResetforgotPass'; // Correct path

import RegisterPage from './src/screens/RegisterPage';
import AboutUs from './src/screens/AboutUs';
import UserProfile from './src/screens/UserProfile';
import InputForms from './src/screens/InputForms';
import VetInputForms from './src/screens/VetInputForms';
import RabiesFieldVaccForm from './src/screens/Rabies_Field_Vacc_Form';
import RabiesFieldVaccForm2 from './src/screens/Rabies_Field_Vacc_Form2';
import NeuterForm from './src/screens/Neuter_Form';
import NeuterForm2 from './src/screens/Neuter_Form2';
import RabiesSampleInformationForm from './src/screens/Rabies_Sample_Information_Form';
import RabiesSampleInformationForm2 from './src/screens/Rabies_Sample_Information_Form2';
import BudgetForm from './src/screens/BudgetForm';
import WeatherForm from './src/screens/WeatherForm';
import ScheduleForm from './src/screens/ScheduleForm';
import IECForm from './src/screens/IECForm';
import AnimalControlForm from './src/screens/AnimalControlForm';
import Rabies_Exposure_Form1 from './src/screens/Rabies_Exposure_Form1';
import Rabies_Exposure_Form2 from './src/screens/Rabies_Exposure_Form2';
import ClientDatabase from './src/screens/ClientDatabase';
import Field_vacc_archives from './src/screens/Field_vacc_archives';
import Neuter_Form_archive from './src/screens/Neuter_Form_archive';
import Sample_form_archive from './src/screens/Sample_form_archive';
import VetArchiveMenu from './src/screens/VetArchiveMenu';
import AnimalControlArchives from './src/screens/AnimalControlArchives';
import IECFormArchive from './src/screens/IECFormArchive';
import ScheduleFormArchive from './src/screens/ScheduleFormArchive';
import BudgetFormArchive from './src/screens/BudgetFormArchive';
import Rabies_Exposure_Form_Archive from './src/screens/Rabies_Exposure_Form_Archive';
import WeatherFormArchive from './src/screens/WeatherFormArchive';
import DownloadableForms from './src/screens/DownloadableForms';
import DownloadableFormsPrivVet from './src/screens/DownloadableFormsPrivVet';
import Landing_page from './src/screens/Landing_page';
import withAuthGuard from './src/context/AuthGuard';

// Screens below require a logged-in session; VetMenu additionally requires
// the CVO/RabDash role. Public screens (Landing_page, Login, ForgotPassword,
// OTP, OTPRegistration, Register, ResetPasswordPage, ResetforgotPass) are
// left unguarded since they're used before/without a session.
const GuardedMainMenu = withAuthGuard(MainMenu);
const GuardedVetMenu = withAuthGuard(VetMenu, ['CVO', 'RabDash']);
const GuardedAboutUs = withAuthGuard(AboutUs);
const GuardedUserProfile = withAuthGuard(UserProfile);
const GuardedInputForms = withAuthGuard(InputForms);
const GuardedVetInputForms = withAuthGuard(VetInputForms);
const GuardedRabiesFieldVaccForm = withAuthGuard(RabiesFieldVaccForm);
const GuardedRabiesFieldVaccForm2 = withAuthGuard(RabiesFieldVaccForm2);
const GuardedNeuterForm = withAuthGuard(NeuterForm);
const GuardedNeuterForm2 = withAuthGuard(NeuterForm2);
const GuardedRabiesSampleInformationForm = withAuthGuard(RabiesSampleInformationForm);
const GuardedRabiesSampleInformationForm2 = withAuthGuard(RabiesSampleInformationForm2);
const GuardedClientDatabase = withAuthGuard(ClientDatabase);
const GuardedBudgetForm = withAuthGuard(BudgetForm);
const GuardedWeatherForm = withAuthGuard(WeatherForm);
const GuardedScheduleForm = withAuthGuard(ScheduleForm);
const GuardedIECForm = withAuthGuard(IECForm);
const GuardedAnimalControlForm = withAuthGuard(AnimalControlForm);
const GuardedRabies_Exposure_Form1 = withAuthGuard(Rabies_Exposure_Form1);
const GuardedRabies_Exposure_Form2 = withAuthGuard(Rabies_Exposure_Form2);
const GuardedField_vacc_archives = withAuthGuard(Field_vacc_archives);
const GuardedNeuter_Form_archive = withAuthGuard(Neuter_Form_archive);
const GuardedSample_form_archive = withAuthGuard(Sample_form_archive);
const GuardedVetArchiveMenu = withAuthGuard(VetArchiveMenu);
const GuardedAnimalControlArchives = withAuthGuard(AnimalControlArchives);
const GuardedIECFormArchive = withAuthGuard(IECFormArchive);
const GuardedScheduleFormArchive = withAuthGuard(ScheduleFormArchive);
const GuardedBudgetFormArchive = withAuthGuard(BudgetFormArchive);
const GuardedRabies_Exposure_Form_Archive = withAuthGuard(Rabies_Exposure_Form_Archive);
const GuardedWeatherFormArchive = withAuthGuard(WeatherFormArchive);
const GuardedDownloadableForms = withAuthGuard(DownloadableForms);
const GuardedDownloadableFormsPrivVet = withAuthGuard(DownloadableFormsPrivVet);

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
          <Stack.Screen name="MainMenu" component={GuardedMainMenu} options={{ headerShown: false }} />
          <Stack.Screen name="VetMenu" component={GuardedVetMenu} options={{ headerShown: false }} />
          <Stack.Screen name="ResetPasswordPage" component={ResetPasswordPage} options={{ headerShown: false }} />
          <Stack.Screen name="ResetforgotPass" component={ResetforgotPass} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterPage} options={{ headerShown: false }} />
          <Stack.Screen name="AboutUs" component={GuardedAboutUs} options={{ headerShown: false }} />
          <Stack.Screen name="UserProfile" component={GuardedUserProfile} options={{ headerShown: false }} />
          <Stack.Screen name="InputForms" component={GuardedInputForms} options={{ headerShown: false }} />
          <Stack.Screen name="VetInputForms" component={GuardedVetInputForms} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Field_Vacc_Form" component={GuardedRabiesFieldVaccForm} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Field_Vacc_Form2" component={GuardedRabiesFieldVaccForm2} options={{ headerShown: false }} />
          <Stack.Screen name="Neuter_Form" component={GuardedNeuterForm} options={{ headerShown: false }} />
          <Stack.Screen name="Neuter_Form2" component={GuardedNeuterForm2} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Sample_Information_Form" component={GuardedRabiesSampleInformationForm} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Sample_Information_Form2" component={GuardedRabiesSampleInformationForm2} options={{ headerShown: false }} />
          <Stack.Screen name="ClientDatabase" component={GuardedClientDatabase} options={{ headerShown: false }} />
          <Stack.Screen name="BudgetForm" component={GuardedBudgetForm} options={{ headerShown: false }} />
          <Stack.Screen name="WeatherForm" component={GuardedWeatherForm} options={{ headerShown: false }} />
          <Stack.Screen name="ScheduleForm" component={GuardedScheduleForm} options={{ headerShown: false }} />
          <Stack.Screen name="IECForm" component={GuardedIECForm} options={{ headerShown: false }} />
          <Stack.Screen name="AnimalControlForm" component={GuardedAnimalControlForm} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Exposure_Form1" component={GuardedRabies_Exposure_Form1} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Exposure_Form2" component={GuardedRabies_Exposure_Form2} options={{ headerShown: false }} />
          <Stack.Screen name="Field_vacc_archives" component={GuardedField_vacc_archives} options={{ headerShown: false }} />
          <Stack.Screen name="Neuter_Form_archive" component={GuardedNeuter_Form_archive} options={{ headerShown: false }} />
          <Stack.Screen name="Sample_form_archive" component={GuardedSample_form_archive} options={{ headerShown: false }} />
          <Stack.Screen name="VetArchiveMenu" component={GuardedVetArchiveMenu} options={{ headerShown: false }} />
          <Stack.Screen name="AnimalControlArchives" component={GuardedAnimalControlArchives} options={{ headerShown: false }} />
          <Stack.Screen name="IECFormArchive" component={GuardedIECFormArchive} options={{ headerShown: false }} />
          <Stack.Screen name="ScheduleFormArchive" component={GuardedScheduleFormArchive} options={{ headerShown: false }} />
          <Stack.Screen name="BudgetFormArchive" component={GuardedBudgetFormArchive} options={{ headerShown: false }} />
          <Stack.Screen name="WeatherFormArchive" component={GuardedWeatherFormArchive} options={{ headerShown: false }} />
          <Stack.Screen name="Rabies_Exposure_Form_Archive" component={GuardedRabies_Exposure_Form_Archive} options={{ headerShown: false }} />
          <Stack.Screen name="DownloadableForms" component={GuardedDownloadableForms} options={{ headerShown: false }} />
          <Stack.Screen name="DownloadableFormsPrivVet" component={GuardedDownloadableFormsPrivVet} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
