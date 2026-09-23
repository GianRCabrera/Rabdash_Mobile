import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, radii, typography, shadow } from '../theme/theme';

const ICONS = {
  date: 'calendar-today',
  time: 'access-time',
  datetime: 'event',
  year: 'calendar-today',
};

const formatValue = (value, mode) => {
  if (!value) return null;
  if (mode === 'time') return value.toLocaleTimeString();
  if (mode === 'datetime') return `${value.toLocaleDateString()} ${value.toLocaleTimeString()}`;
  if (mode === 'year') return value.getFullYear().toString();
  return value.toLocaleDateString();
};

// The "tap to open a date picker" field used across every form screen —
// visually matches AppInput (same border/radius/shadow) but renders text
// instead of a TextInput, since the value only ever comes from
// DateTimePickerModal, never typed. The icon signals that tapping opens a
// picker rather than a keyboard, which plain placeholder text alone doesn't
// make obvious. `mode` ('date' | 'time' | 'datetime') controls both the
// icon and how a Date value is formatted — several forms (Rabies Field
// Vacc, Rabies Exposure) need time-only or combined date+time fields
// alongside plain date fields.
const AppDateField = ({ label, value, mode = 'date', placeholder, onPress }) => {
  const resolvedPlaceholder =
    placeholder ||
    (mode === 'time' ? 'Select time' : mode === 'datetime' ? 'Select date & time' : mode === 'year' ? 'Select year' : 'Select date');
  const displayValue = formatValue(value, mode);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity style={styles.inputRow} onPress={onPress} activeOpacity={0.75}>
        <Text style={[styles.text, !displayValue && styles.placeholder]} numberOfLines={1}>
          {displayValue || resolvedPlaceholder}
        </Text>
        <Icon style={styles.icon} name={ICONS[mode] || ICONS.date} size={18} color={colors.textOnSurfaceMuted} />
      </TouchableOpacity>
    </View>
  );
};

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    ...shadow,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
    flexShrink: 1,
    marginRight: spacing.sm,
  },
  icon: {
    flexShrink: 0,
  },
  placeholder: {
    color: colors.textOnSurfaceMuted,
  },
});

export default AppDateField;
