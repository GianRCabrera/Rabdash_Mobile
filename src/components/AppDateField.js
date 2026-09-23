import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radii, typography, shadow } from '../theme/theme';

// The "tap to open a date picker" field used across every form screen —
// visually matches AppInput (same border/radius/shadow) but renders text
// instead of a TextInput, since the value only ever comes from
// DateTimePickerModal, never typed.
const AppDateField = ({ label, value, placeholder = 'Select date', onPress }) => (
  <View style={styles.container}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TouchableOpacity style={styles.inputRow} onPress={onPress} activeOpacity={0.75}>
      <Text style={[styles.text, !value && styles.placeholder]}>{value || placeholder}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputRow: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    justifyContent: 'center',
    ...shadow,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
  },
  placeholder: {
    color: colors.textOnSurfaceMuted,
  },
});

export default AppDateField;
