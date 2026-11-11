import React from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usesVetMenu } from '../constants/roles';
import { ListRow, MenuScreen, SectionTitle, WelcomeCard } from '../components';

// Home menu for every role. VetMenu (CVO, CVO Admin, RabDash) re-exports this;
// the role only changes which form/archive/download screens the rows open.
const MainMenu = () => {
  const navigation = useNavigation();
  const { state, dispatch } = useAuth();
  const apiURL = process.env.EXPO_PUBLIC_URL;
  const { email, position } = state.user;
  const isVet = usesVetMenu(position);

  const go = (route) => () => navigation.navigate(route, undefined, { pop: true });

  const handleLogout = async () => {
    try {
      await axios.post(`${apiURL}/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Error during logout:', error.message);
    }
    dispatch({ type: 'LOGOUT' });
    navigation.navigate('Login', undefined, { pop: true });
  };

  return (
    <MenuScreen title="RabDash">
      <WelcomeCard email={email} position={position} />

      <SectionTitle title="Work" first />
      <ListRow
        icon="file-document-edit-outline"
        title="Input Forms"
        subtitle="Fill in a new report"
        onPress={go(isVet ? 'VetInputForms' : 'InputForms')}
      />
      <ListRow
        icon="folder-open-outline"
        title="Form Archives"
        subtitle="View and edit past submissions"
        onPress={go(isVet ? 'VetArchiveMenu' : 'ClientDatabase')}
      />
      <ListRow
        icon="file-download-outline"
        title="Downloadable Forms"
        subtitle="Excel report templates"
        onPress={go(isVet ? 'DownloadableForms' : 'DownloadableFormsPrivVet')}
      />

      <SectionTitle title="Account" />
      <ListRow icon="account-circle-outline" title="My Profile" subtitle="Your details and password" onPress={go('UserProfile')} />
      <ListRow icon="information-outline" title="About RabDash" subtitle="The project and our partners" onPress={go('AboutUs')} />
      <ListRow icon="logout" title="Log Out" tone="danger" showChevron={false} onPress={handleLogout} />
    </MenuScreen>
  );
};

export default MainMenu;
