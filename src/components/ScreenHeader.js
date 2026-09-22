import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii, typography, shadow } from '../theme/theme';

// The white rounded title pill seen on most screens (assumes the screen's
// own background is already the brand red, so this reads as a contrasting
// card). variant="plain" drops the white box for screens that just want
// white bold text directly on the red background instead — both patterns
// already existed across the app; this just makes each one consistent
// instead of every screen picking its own radius/shadow/font size.
const ScreenHeader = ({ title, variant = 'card' }) => {
  if (variant === 'plain') {
    return <Text style={styles.plainText}>{title}</Text>;
  }
  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
    ...shadow,
  },
  cardText: {
    ...typography.title,
    color: colors.primary,
    textAlign: 'center',
  },
  plainText: {
    ...typography.title,
    color: colors.onPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});

export default ScreenHeader;
