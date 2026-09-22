import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii, shadow } from '../theme/theme';

// Shared layout for the app's grid-of-buttons menu screens (MainMenu, VetMenu,
// InputForms, VetInputForms, ClientDatabase, VetArchiveMenu): a white top
// area with a title (+ optional badge, e.g. the user's position), and a red
// rounded card below holding a scrollable button list. Replaces six near-
// identical hand-rolled StyleSheets, each with its own absolute-positioned
// back/logout button and magic-number spacing.
const MenuScreen = ({ title, badge, backgroundImage, children }) => {
  return (
    <View style={styles.container}>
      {backgroundImage ? <Image source={backgroundImage} style={styles.backgroundImage} /> : null}
      <View style={styles.topArea}>
        <Text style={styles.header}>{title}</Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.card}>
        <ScrollView contentContainerStyle={styles.buttonList} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    position: 'absolute',
    width: '200%',
    height: '42%',
    opacity: 0.12,
    top: -30,
    right: '-60%',
  },
  topArea: {
    paddingTop: spacing.xxxl * 1.75,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  header: {
    ...typography.largeTitle,
    color: colors.primary,
    textAlign: 'center',
  },
  badge: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    ...shadow,
  },
  badgeText: {
    ...typography.label,
    color: colors.primary,
  },
  card: {
    flex: 1,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radii.md * 2,
    borderTopRightRadius: radii.md * 2,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  buttonList: {
    alignItems: 'center',
    flexGrow: 1,
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
