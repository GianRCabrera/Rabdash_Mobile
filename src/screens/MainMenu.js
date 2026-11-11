import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar, Platform, StyleSheet } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usesVetMenu } from '../constants/roles';
import { formsFor } from '../constants/catalog';
import { AppModal, ListRow, SectionTitle } from '../components';
import { colors, spacing, radii, typography, shadows } from '../theme/theme';

const greetingFor = (hour) => {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Tile = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.75} accessibilityRole="button">
    <View style={styles.tileIcon}>
      <MaterialCommunityIcons name={icon} size={26} color={colors.primary} />
    </View>
    <Text style={styles.tileTitle} numberOfLines={1}>{title}</Text>
    <Text style={styles.tileSubtitle} numberOfLines={2}>{subtitle}</Text>
  </TouchableOpacity>
);

// Home screen for every role. VetMenu (CVO, CVO Admin, RabDash) re-exports
// this; the role only changes which form/archive/download screens it opens.
const MainMenu = () => {
  const navigation = useNavigation();
  const { state, dispatch } = useAuth();
  const insets = useContext(SafeAreaInsetsContext);
  const topInset = insets ? insets.top : Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const apiURL = process.env.EXPO_PUBLIC_URL;
  const { email, position } = state.user;
  const isVet = usesVetMenu(position);
  const [firstName, setFirstName] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  // The name isn't kept with the saved login, so fetch it for the greeting.
  // If it fails (offline, backend waking up) the greeting simply has no name.
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

  const greeting = greetingFor(new Date().getHours());
  const quickForms = formsFor(position).slice(0, 3);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: topInset + spacing.lg }]}>
          <View style={styles.heroTop}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
              </View>
              <Text style={styles.brand}>RabDash</Text>
            </View>
            <TouchableOpacity
              onPress={() => setConfirmLogout(true)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Log out"
              style={styles.logoutButton}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.greeting}>{firstName ? `${greeting}, ${firstName}` : greeting}</Text>
          {email ? <Text style={styles.email} numberOfLines={1}>{email}</Text> : null}
          {position ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{position}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <View style={styles.grid}>
            <Tile icon="file-document-edit-outline" title="Input Forms" subtitle="Fill in a new report" onPress={go(isVet ? 'VetInputForms' : 'InputForms')} />
            <Tile icon="folder-open-outline" title="Form Archives" subtitle="View and edit submissions" onPress={go(isVet ? 'VetArchiveMenu' : 'ClientDatabase')} />
            <Tile icon="file-download-outline" title="Downloads" subtitle="Excel report templates" onPress={go(isVet ? 'DownloadableForms' : 'DownloadableFormsPrivVet')} />
            <Tile icon="account-circle-outline" title="My Profile" subtitle="Details and password" onPress={go('UserProfile')} />
          </View>

          <SectionTitle title="Quick start" first />
          {quickForms.map((form) => (
            <ListRow
              key={form.key}
              icon={form.icon}
              title={form.title}
              subtitle={form.subtitle}
              onPress={go(form.route)}
            />
          ))}

          <SectionTitle title="More" />
          <ListRow icon="information-outline" title="About RabDash" subtitle="The project and our partners" onPress={go('AboutUs')} />
        </View>
      </ScrollView>

      <AppModal
        isVisible={confirmLogout}
        message="Log out of RabDash?"
        onBackdropPress={() => setConfirmLogout(false)}
        actions={[
          { label: 'Cancel', variant: 'secondary', onPress: () => setConfirmLogout(false) },
          { label: 'Log Out', onPress: handleLogout },
        ]}
      />
    </View>
  );
};

const TILE_OVERLAP = spacing.xxxl;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.xxxl,
  },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl + TILE_OVERLAP,
    borderBottomLeftRadius: radii.md * 1.5,
    borderBottomRightRadius: radii.md * 1.5,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logo: {
    width: 28,
    height: 28,
  },
  brand: {
    ...typography.subtitle,
    color: colors.onPrimary,
    letterSpacing: 0.5,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    ...typography.largeTitle,
    color: colors.onPrimary,
  },
  email: {
    ...typography.body,
    color: colors.onPrimary,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  chipText: {
    ...typography.label,
    color: colors.primary,
  },
  body: {
    paddingHorizontal: spacing.lg,
    marginTop: -TILE_OVERLAP,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  tile: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  tileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  tileTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  tileSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default MainMenu;
