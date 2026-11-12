import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform, StyleSheet } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usesVetMenu } from '../constants/roles';
import { AppModal, ListGroup, ListRow, MenuScreen, SectionTitle, SidePanel } from '../components';
import { colors, spacing, radii, typography, shadows } from '../theme/theme';
import appConfig from '../../app.json';

const APP_VERSION = appConfig.expo.version;

// A square tile for one of the main actions on the home screen.
const ActionTile = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.8} accessibilityRole="button">
    <View style={styles.tileTop}>
      <View style={styles.tileIcon}>
        <MaterialCommunityIcons name={icon} size={28} color={colors.onPrimary} />
      </View>
      <Ionicons name="arrow-forward" size={20} color={colors.primary} />
    </View>
    <View>
      <Text style={styles.tileTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.tileSubtitle} numberOfLines={1}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

// Home screen for every role. VetMenu (CVO, CVO Admin, RabDash) re-exports
// this; the role only changes which form/archive/download screens it opens.
// The account actions (profile, about, log out) live in a panel that slides
// in from the round profile button in the header.
const MainMenu = () => {
  const navigation = useNavigation();
  const { state, dispatch } = useAuth();
  const insets = useContext(SafeAreaInsetsContext);
  const topInset = insets ? insets.top : Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const apiURL = process.env.EXPO_PUBLIC_URL;
  const { email, position } = state.user;
  const isVet = usesVetMenu(position);
  const [profile, setProfile] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  // The name isn't kept with the saved login, so fetch it for the greeting
  // and the panel; if that fails (offline, backend waking up) both simply
  // show no name.
  useEffect(() => {
    let active = true;
    axios
      .get(`${apiURL}/userProfile`)
      .then((response) => {
        if (active && response.data) setProfile(response.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [apiURL]);

  const go = (route) => () => navigation.navigate(route, undefined, { pop: true });
  const goFromPanel = (route) => () => {
    setPanelOpen(false);
    navigation.navigate(route, undefined, { pop: true });
  };

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

  const firstName = profile?.name;
  const fullName = profile ? `${profile.name || ''} ${profile.last_name || ''}`.trim() : '';
  const initials =
    (fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('') || (email || '?').charAt(0)).toUpperCase();

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

  const profileButton = (
    <TouchableOpacity
      onPress={() => setPanelOpen(true)}
      accessibilityRole="button"
      accessibilityLabel="Open account menu"
      hitSlop={8}
      style={styles.avatarButton}
    >
      <Text style={styles.avatarButtonText}>{initials}</Text>
    </TouchableOpacity>
  );

  return (
    <MenuScreen title="RabDash" badge={position} headerVariant="home" headerRight={profileButton}>
      <View style={styles.greetingRow}>
        <View style={styles.greetingIcon}>
          <MaterialCommunityIcons name={timeOfDay.icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.greetingText}>
          <Text style={styles.greeting} numberOfLines={1}>{greeting}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <ActionTile
          icon="file-document-edit-outline"
          title="Input Forms"
          subtitle="Fill in a report"
          onPress={go(isVet ? 'VetInputForms' : 'InputForms')}
        />
        <ActionTile
          icon="folder-open-outline"
          title="Form Archives"
          subtitle="Past submissions"
          onPress={go(isVet ? 'VetArchiveMenu' : 'ClientDatabase')}
        />
      </View>

      <TouchableOpacity
        style={styles.wideCard}
        onPress={go(isVet ? 'DownloadableForms' : 'DownloadableFormsPrivVet')}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <View style={styles.tileIcon}>
          <MaterialCommunityIcons name="file-download-outline" size={28} color={colors.onPrimary} />
        </View>
        <View style={styles.wideText}>
          <Text style={styles.tileTitle}>Downloadable Forms</Text>
          <Text style={styles.tileSubtitle}>Excel report templates</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={colors.primary} />
      </TouchableOpacity>

      <SectionTitle title="More" />
      <ListGroup>
        <ListRow icon="information-outline" title="About RabDash" subtitle="The project and our partners" onPress={go('AboutUs')} />
      </ListGroup>

      <Text style={styles.version}>RabDash Mobile · v{APP_VERSION}</Text>

      <SidePanel visible={panelOpen} onClose={() => setPanelOpen(false)}>
        <View style={[styles.panelHeader, { paddingTop: topInset + spacing.xl }]}>
          <View style={styles.panelAvatar}>
            <Text style={styles.panelAvatarText}>{initials}</Text>
          </View>
          <Text style={styles.panelName} numberOfLines={1}>{fullName || 'RabDash user'}</Text>
          {email ? <Text style={styles.panelEmail} numberOfLines={1}>{email}</Text> : null}
          {position ? (
            <View style={styles.panelChip}>
              <Text style={styles.panelChipText}>{position}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.panelBody}>
          <ListGroup>
            <ListRow icon="account-circle-outline" title="My Profile" subtitle="Your details and password" onPress={goFromPanel('UserProfile')} />
          </ListGroup>
          <ListGroup style={styles.panelLogout}>
            <ListRow
              icon="logout"
              title="Log Out"
              tone="danger"
              showChevron={false}
              onPress={() => {
                setPanelOpen(false);
                setConfirmLogout(true);
              }}
            />
          </ListGroup>
        </View>
      </SidePanel>

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
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  avatarButtonText: {
    ...typography.bodyStrong,
    fontSize: 17,
    color: colors.primary,
  },
  // Same left padding as the cards below, so the greeting lines up with them.
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  greetingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.lg,
  },
  wideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md + 4,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.md,
  },
  wideText: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  tile: {
    width: '47.5%',
    aspectRatio: 1,
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md + 4,
    padding: spacing.lg,
    ...shadows.md,
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  tileIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    ...typography.bodyStrong,
    fontSize: 17,
    color: colors.textPrimary,
  },
  tileSubtitle: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  version: {
    ...typography.caption,
    color: colors.textOnSurfaceMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  panelHeader: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  panelAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  panelAvatarText: {
    ...typography.title,
    color: colors.primary,
  },
  panelName: {
    ...typography.subtitle,
    color: colors.onPrimary,
  },
  panelEmail: {
    ...typography.body,
    color: colors.onPrimary,
    opacity: 0.9,
    marginTop: 2,
  },
  panelChip: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  panelChipText: {
    ...typography.label,
    color: colors.primary,
  },
  panelBody: {
    padding: spacing.lg,
  },
  panelLogout: {
    marginTop: spacing.lg,
  },
});

export default MainMenu;
