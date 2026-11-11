import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usesVetMenu } from '../constants/roles';
import { AppModal, ListGroup, ListRow, MenuScreen, SectionTitle } from '../components';
import { colors, spacing, typography } from '../theme/theme';
import appConfig from '../../app.json';

const APP_VERSION = appConfig.expo.version;

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
      <SectionTitle title="Work" first />
      <ListGroup>
        <ListRow icon="file-document-edit-outline" title="Input Forms" subtitle="Fill in a new report" onPress={go(isVet ? 'VetInputForms' : 'InputForms')} />
        <ListRow icon="folder-open-outline" title="Form Archives" subtitle="View and edit past submissions" onPress={go(isVet ? 'VetArchiveMenu' : 'ClientDatabase')} />
        <ListRow icon="file-download-outline" title="Downloadable Forms" subtitle="Excel report templates" onPress={go(isVet ? 'DownloadableForms' : 'DownloadableFormsPrivVet')} />
      </ListGroup>

      <SectionTitle title="Account" />
      <ListGroup>
        <ListRow icon="account-circle-outline" title="My Profile" subtitle="Your details and password" onPress={go('UserProfile')} />
        <ListRow icon="information-outline" title="About RabDash" subtitle="The project and our partners" onPress={go('AboutUs')} />
      </ListGroup>

      <ListGroup style={styles.logoutGroup}>
        <ListRow icon="logout" title="Log Out" tone="danger" showChevron={false} onPress={() => setConfirmLogout(true)} />
      </ListGroup>

      <Text style={styles.version}>RabDash Mobile · v{APP_VERSION}</Text>

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

const styles = StyleSheet.create({
  logoutGroup: {
    marginTop: spacing.xl,
  },
  version: {
    ...typography.caption,
    color: colors.textOnSurfaceMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default MainMenu;
