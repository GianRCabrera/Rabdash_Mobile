import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radii, typography, shadow } from '../theme/theme';

// variant: 'primary' (solid red, white text — the main action on a screen),
// 'secondary' (white with a red border/text — for a screen's second action,
// e.g. "Back" next to "Submit"), 'ghost' (no fill/border, just red text —
// for low-emphasis links like modal dismiss buttons), 'inverse' (solid
// white, red text, no border — for the main action on a screen whose own
// background is already the brand red, e.g. Login, where a bordered
// 'secondary' button wouldn't stand out against the red behind it), or
// 'danger' (solid danger-red, white text — a destructive action like
// deleting an archived record, visually distinct from the brand-red
// 'primary' so it doesn't read as just another normal action).
const AppButton = ({ title, onPress, variant = 'primary', disabled = false, loading = false, style, textStyle }) => {
  const variantStyle = styles[variant] || styles.primary;
  const variantTextStyle = textStyles[variant] || textStyles.primary;

  return (
    <TouchableOpacity
      style={[styles.base, variantStyle, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.onPrimary : colors.primary} />
      ) : (
        <Text style={[textStyles.base, variantTextStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
    shadowOpacity: 0.1,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    // Low-emphasis text link (e.g. a modal's dismiss action) — stays flat,
    // not raised like the other variants.
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  inverse: {
    backgroundColor: colors.surface,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
});

const textStyles = StyleSheet.create({
  base: {
    ...typography.bodyStrong,
  },
  primary: { color: colors.onPrimary },
  secondary: { color: colors.primary },
  ghost: { color: colors.primary },
  inverse: { color: colors.primary },
  danger: { color: colors.onPrimary },
});

export default AppButton;
