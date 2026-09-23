import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import ScreenHeader from './ScreenHeader';
import { colors, spacing } from '../theme/theme';

// Shared layout for the app's grid-of-buttons menu screens (MainMenu, VetMenu,
// InputForms, VetInputForms, ClientDatabase, VetArchiveMenu): solid red
// background (matching Login/Landing/FormScreen), a white header card (title
// + optional subtitle, e.g. the user's position), and the button list below
// it. Header and buttons live in ONE centered group (not a fixed header +
// independently-positioned list) — the same fix Landing_page needed: two
// separately-positioned blocks drift apart or leave a lopsided gap depending
// on content length, while one group centered as a whole keeps consistent
// internal spacing and puts any leftover space symmetrically above/below
// instead of dumping it all at the bottom. On the longer 8-9 button screens
// (VetInputForms/VetArchiveMenu) the content simply exceeds the centered
// space and scrolls from the top as normal.
const MenuScreen = ({ title, badge, children }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={title} subtitle={badge} />
        <View style={styles.buttonList}>{children}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  buttonList: {
    alignItems: 'center',
    marginTop: spacing.xl,
    width: '100%',
  },
});

// Shared button styles for MenuScreen's contents — a full-width button, a
// two-up row for grid layouts (VetInputForms/VetArchiveMenu's 8 items), and
// the bordered/transparent "Main Menu" or "Log Out" action that always sits
// last, visually distinct from the primary nav buttons above it.
export const menuStyles = StyleSheet.create({
  button: {
    width: '100%',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  rowButton: {
    flex: 1,
  },
  backButton: {
    width: '100%',
    marginTop: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.onPrimary,
  },
  backButtonText: {
    color: colors.onPrimary,
  },
});

export default MenuScreen;
