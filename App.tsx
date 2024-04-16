import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './AuthContext'; // Import the AuthProvider

//Screens
import LoginPage from './LoginPage';
import MainMenu from './MainMenu';
import VetMenu from './VetMenu';
import ResetPasswordPage from './ResetPasswordPage';
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

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="MainMenu" component={MainMenu} />
          <Stack.Screen name="VetMenu" component={VetMenu} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordPage} />
          <Stack.Screen name="Register" component={RegisterPage} />
          <Stack.Screen name="AboutUs" component={AboutUs} />
          <Stack.Screen name="UserProfile" component={UserProfile} />
          <Stack.Screen name="InputForms" component={InputForms} />
          <Stack.Screen name="VetInputForms" component={VetInputForms} />
          <Stack.Screen name="Rabies_Field_Vacc_Form" component={RabiesFieldVaccForm} />
          <Stack.Screen name="Rabies_Field_Vacc_Form2" component={RabiesFieldVaccForm2} />
          <Stack.Screen name="Neuter_Form" component={NeuterForm} />
          <Stack.Screen name="Neuter_Form2" component={NeuterForm2} />
          <Stack.Screen name="Rabies_Sample_Information_Form" component={RabiesSampleInformationForm} />
          <Stack.Screen name="Rabies_Sample_Information_Form2" component={RabiesSampleInformationForm2} />
          <Stack.Screen name="ClientDatabase" component={ClientDatabase} />
          <Stack.Screen name="BudgetForm" component={BudgetForm} />
          <Stack.Screen name="WeatherForm" component={WeatherForm} />
          <Stack.Screen name="ScheduleForm" component={ScheduleForm} />
          <Stack.Screen name="IECForm" component={IECForm} />
          <Stack.Screen name="AnimalControlForm" component={AnimalControlForm} />
          <Stack.Screen name="Rabies_Exposure_Form1" component={Rabies_Exposure_Form1} />
          <Stack.Screen name="Rabies_Exposure_Form2" component={Rabies_Exposure_Form2} />
          <Stack.Screen name="Field_vacc_archives" component={Field_vacc_archives} />
          <Stack.Screen name="Neuter_Form_archive" component={Neuter_Form_archive} />
          <Stack.Screen name="Sample_form_archive" component={Sample_form_archive} />
          <Stack.Screen name="VetArchiveMenu" component={VetArchiveMenu} />
          <Stack.Screen name="AnimalControlArchives" component={AnimalControlArchives} />
          <Stack.Screen name="IECFormArchive" component={IECFormArchive} />
          <Stack.Screen name="ScheduleFormArchive" component={ScheduleFormArchive} />
          <Stack.Screen name="BudgetFormArchive" component={BudgetFormArchive} />
          <Stack.Screen name="WeatherFormArchive" component={WeatherFormArchive} />
          <Stack.Screen name="Rabies_Exposure_Form_Archive" component={Rabies_Exposure_Form_Archive} />
          <Stack.Screen name="DownloadableForms" component={DownloadableForms} />
          <Stack.Screen name="DownloadableFormsPrivVet" component={DownloadableFormsPrivVet} />

        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
