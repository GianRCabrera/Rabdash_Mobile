import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, radii, shadow } from '../theme/theme';

// The white rounded container used everywhere (form wrappers, archive list
// items, menu panels) — previously each screen re-specified its own
// radius/padding/shadow (or skipped the shadow entirely).
const AppCard = ({ children, style, noPadding = false }) => (
  <View style={[styles.card, !noPadding && styles.padded, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    ...shadow,
  },
  padded: {
    padding: spacing.xl,
  },
});

export default AppCard;
