import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/theme';

// A small section heading for breaking up a long flat list of form fields
// (e.g. "Location", "Participation") into scannable groups — every field on
// a form screen previously carried identical visual weight regardless of
// how many there were, which made the longer forms (IEC, Rabies Sample,
// Animal Control) hard to scan at a glance.
const FormSectionLabel = ({ title, first = false }) => (
  <Text style={[styles.label, first && styles.first]}>{title}</Text>
);

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  first: {
    marginTop: 0,
  },
});

export default FormSectionLabel;
