import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar, Platform, StyleSheet } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usesVetMenu } from '../constants/roles';
import { formsFor } from '../constants/catalog';
import { ListRow, SectionTitle } from '../components';
import { colors, spacing, radii, typography, shadows } from '../theme/theme';

const greetingFor = (hour) => {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Tile = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.75} accessibilityRole="button">
    <View style={styles.tileIcon}>
      <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
    </View>
    <Text style={styles.tileTitle} numberOfLines={1}>{title}</Text>
  </TouchableOpacity>
);

// Home screen for every role. VetMenu (CVO, CVO Admin, RabDash) re-exports
// this; the role only changes which form/archive/download screens it opens.
// Profile, About and Log Out live on the profile screen (the round button
// top right), so the home screen is just "what do you want to do".
const MainMenu = () => {
  const navigation = useNavigation();
  const { state } = useAuth();
  const insets = useContext(SafeAreaInsetsContext);
  const topInset = insets ? insets.top : Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const apiURL = process.env.EXPO_PUBLIC_URL;
  const { email, position } = state.user;
  const isVet = usesVetMenu(position);
  const [firstName, setFirstName] = useState(null);

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

  const greeting = greetingFor(new Date().getHours());
  const initial = (firstName || email || '?').trim().charAt(0).toUpperCase();
  const quickForms = formsFor(position).slice(0, 3);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: topInset + spacing.md }]}>
          <View style={styles.heroTop}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
              </View>
              <Text style={styles.brand}>RabDash</Text>
            </View>
            <TouchableOpacity
              onPress={go('UserProfile')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="My profile"
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initial}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.greeting}>{firstName ? `${greeting}, ${firstName}` : greeting}</Text>
          {position ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{position}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <View style={styles.tiles}>
            <Tile icon="file-document-edit-outline" title="New report" onPress={go(isVet ? 'VetInputForms' : 'InputForms')} />
            <Tile icon="folder-open-outline" title="Archives" onPress={go(isVet ? 'VetArchiveMenu' : 'ClientDatabase')} />
            <Tile icon="file-download-outline" title="Downloads" onPress={go(isVet ? 'DownloadableForms' : 'DownloadableFormsPrivVet')} />
          </View>

          <View style={styles.sectionHeader}>
            <SectionTitle title="Quick start" first />
            <TouchableOpacity onPress={go(isVet ? 'VetInputForms' : 'InputForms')} hitSlop={8}>
              <Text style={styles.link}>All forms</Text>
            </TouchableOpacity>
          </View>
          {quickForms.map((form) => (
            <ListRow
              key={form.key}
              icon={form.icon}
              title={form.title}
              subtitle={form.subtitle}
              onPress={go(form.route)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const TILE_OVERLAP = spacing.xxl;

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
    marginBottom: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logo: {
    width: 24,
    height: 24,
  },
  brand: {
    ...typography.bodyStrong,
    fontSize: 17,
    color: colors.onPrimary,
    letterSpacing: 0.3,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.subtitle,
    color: colors.primary,
  },
  greeting: {
    ...typography.title,
    fontSize: 24,
    color: colors.onPrimary,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  chipText: {
    ...typography.label,
    color: colors.onPrimary,
  },
  body: {
    paddingHorizontal: spacing.lg,
    marginTop: -TILE_OVERLAP,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    ...shadows.md,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  tileTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  link: {
    ...typography.label,
    color: colors.primary,
    marginRight: spacing.xs,
  },
});

export default MainMenu;
