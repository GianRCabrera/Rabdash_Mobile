import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/theme';

// Small uppercase heading above a group of ListRows.
const SectionTitle = ({ title, first = false }) => (
  <Text style={[styles.title, first && styles.first]}>{title}</Text>
);

const styles = StyleSheet.create({
  title: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  first: {
    marginTop: 0,
  },
});

export default SectionTitle;
