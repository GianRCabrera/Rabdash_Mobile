import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Screen from './Screen';
import { colors, spacing, radii, typography } from '../theme/theme';

// Shared layout for the form screens: the red header (with a back chevron)
// over the light background, and one white card holding the fields.
//
// The card sizes to its content (it's inside the ScrollView, not a flex:1
// wrapper), so short forms like Budget don't end in a big empty white void.
// It is deliberately flat (border, no elevation): AppDropdown opens its list
// inside this card, and on Android an elevated card can draw that list
// behind the fields below it.
const FormScreen = ({ title, onBack, children }) => (
  <Screen title={title} onBack={onBack} showBack>
    <View style={styles.card}>
      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
        <Text style={styles.noticeText}>Input "N/A" if information is unavailable</Text>
      </View>
      {children}
    </View>
  </Screen>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  noticeText: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
  },
});

export default FormScreen;
