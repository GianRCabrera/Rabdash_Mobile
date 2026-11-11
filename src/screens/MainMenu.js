import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
  const [firstName, setFirstName] = useState(null);

  // The name isn't kept with the saved login, so fetch it for the greeting;
  // if that fails (offline, backend waking up) the greeting has no name.
  useEffect(() => {
    let active = true;
    axios
      .get(`${apiURL}/userProfile`)
      .then((response) => {
        if (active && response.data?.name) setFirstName(response.data.name);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [apiURL]);

  const now = new Date();
  const hour = now.getHours();
  const timeOfDay =
    hour < 12
      ? { text: 'Good morning', icon: 'white-balance-sunny' }
      : hour < 18
        ? { text: 'Good afternoon', icon: 'weather-sunset' }
        : { text: 'Good evening', icon: 'weather-night' };
  const greeting = `${timeOfDay.text}${firstName ? `, ${firstName}` : ''}`;
  const today = now.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });

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
    <MenuScreen title="RabDash" badge={position} headerVariant="home">
      <View style={styles.greetingRow}>
        <View style={styles.greetingIcon}>
          <MaterialCommunityIcons name={timeOfDay.icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.greetingText}>
          <Text style={styles.greeting} numberOfLines={1}>{greeting}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
      </View>

      <SectionTitle title="Work" first />
      <ListGroup>
        <ListRow size="large" icon="file-document-edit-outline" title="Input Forms" subtitle="Fill in a new report" onPress={go(isVet ? 'VetInputForms' : 'InputForms')} />
        <ListRow size="large" icon="folder-open-outline" title="Form Archives" subtitle="View and edit past submissions" onPress={go(isVet ? 'VetArchiveMenu' : 'ClientDatabase')} />
        <ListRow size="large" icon="file-download-outline" title="Downloadable Forms" subtitle="Excel report templates" onPress={go(isVet ? 'DownloadableForms' : 'DownloadableFormsPrivVet')} />
      </ListGroup>

      <SectionTitle title="Account" />
      <ListGroup>
        <ListRow size="large" icon="account-circle-outline" title="My Profile" subtitle="Your details and password" onPress={go('UserProfile')} />
        <ListRow size="large" icon="information-outline" title="About RabDash" subtitle="The project and our partners" onPress={go('AboutUs')} />
      </ListGroup>

      <ListGroup style={styles.logoutGroup}>
        <ListRow size="large" icon="logout" title="Log Out" tone="danger" showChevron={false} onPress={() => setConfirmLogout(true)} />
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
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginLeft: spacing.xs,
  },
  greetingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    ...typography.subtitle,
    fontSize: 20,
    color: colors.textPrimary,
  },
  date: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
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
