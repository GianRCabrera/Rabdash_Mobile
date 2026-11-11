import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usesVetMenu } from '../constants/roles';
import { AppModal, ListRow, MenuScreen } from '../components';

// Home menu for every role. VetMenu (CVO, CVO Admin, RabDash) re-exports
// this; the role only changes which form/archive/download screens it opens.
const MainMenu = () => {
  const navigation = useNavigation();
  const { state, dispatch } = useAuth();
  const apiURL = process.env.EXPO_PUBLIC_URL;
  const { position } = state.user;
  const isVet = usesVetMenu(position);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const go = (route) => () => navigation.navigate(route, undefined, { pop: true });

  const handleLogout = async () => {
    setConfirmLogout(false);
    try {
      await axios.post(`${apiURL}/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Error during logout:', error.message);
    }
    dispatch({ type: 'LOGOUT' });
    navigation.navigate('Login', undefined, { pop: true });
  };

  return (
    <MenuScreen title="RabDash" badge={position}>
      <ListRow icon="file-document-edit-outline" title="Input Forms" onPress={go(isVet ? 'VetInputForms' : 'InputForms')} />
      <ListRow icon="folder-open-outline" title="Form Archives" onPress={go(isVet ? 'VetArchiveMenu' : 'ClientDatabase')} />
      <ListRow icon="file-download-outline" title="Downloadable Forms" onPress={go(isVet ? 'DownloadableForms' : 'DownloadableFormsPrivVet')} />
      <ListRow icon="account-circle-outline" title="My Profile" onPress={go('UserProfile')} />
      <ListRow icon="information-outline" title="About RabDash" onPress={go('AboutUs')} />
      <ListRow icon="logout" title="Log Out" tone="danger" showChevron={false} onPress={() => setConfirmLogout(true)} />

      <AppModal
        isVisible={confirmLogout}
        message="Log out of RabDash?"
        onBackdropPress={() => setConfirmLogout(false)}
        actions={[
          { label: 'Cancel', variant: 'secondary', onPress: () => setConfirmLogout(false) },
          { label: 'Log Out', onPress: handleLogout },
        ]}
      />
    </MenuScreen>
  );
};

export default MainMenu;
