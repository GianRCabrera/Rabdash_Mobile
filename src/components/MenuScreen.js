import React from 'react';
import { View, StyleSheet } from 'react-native';
import Screen from './Screen';
import { colors, spacing } from '../theme/theme';

// Layout for the menu screens (MainMenu, VetMenu, InputForms, ...): the red
// header with the screen title (and the user's position as subtitle) over
// the light background, then the button list. Being replaced by bottom tabs
// in the navigation revamp.
const MenuScreen = ({ title, badge, showBack = false, showLogo = false, headerVariant, headerRight, refreshControl, children }) => (
  <Screen title={title} subtitle={badge} showBack={showBack} showLogo={showLogo} headerVariant={headerVariant} right={headerRight} refreshControl={refreshControl}>
    <View style={styles.buttonList}>{children}</View>
  </Screen>
);

const styles = StyleSheet.create({
  buttonList: {
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
  // Same two-up row, but for a form screen's trailing Back/Submit pair —
  // needs breathing room above it (the last field's own marginBottom isn't
  // enough on its own) rather than below, since nothing follows it.
  formActionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  // Outline red-on-light: used on light screens (archives, profile, about)
  // as well as the menus, so it must not be white.
  backButton: {
    width: '100%',
    marginTop: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  backButtonText: {
    color: colors.primary,
  },
});

export default MenuScreen;
