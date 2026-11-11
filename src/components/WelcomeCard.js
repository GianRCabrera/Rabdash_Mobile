import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, spacing, radii, typography, shadows } from '../theme/theme';

// The greeting at the top of the home menu: the RabDash logo, who is signed
// in, and their role as a chip.
const WelcomeCard = ({ email, position }) => (
  <View style={styles.card}>
    <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
    <View style={styles.text}>
      <Text style={styles.greeting}>Welcome back</Text>
      {email ? <Text style={styles.email} numberOfLines={1}>{email}</Text> : null}
      {position ? (
        <View style={styles.chip}>
          <Text style={styles.chipText}>{position}</Text>
        </View>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  logo: {
    width: 56,
    height: 56,
    marginRight: spacing.lg,
  },
  text: {
    flex: 1,
  },
  greeting: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  chipText: {
    ...typography.label,
    color: colors.primary,
  },
});

export default WelcomeCard;
