import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radii, typography, shadows } from '../theme/theme';

// A tappable white card row: a tinted icon circle, a title, an optional
// subtitle, and a chevron. Used for the lists of forms, records, downloads
// and profile actions. `icon` is a MaterialCommunityIcons name.
// Inside a ListGroup it drops its own card styling (`grouped`) and draws a
// divider under itself unless it's the last row (`showDivider`).
const ListRow = ({ icon, title, subtitle, onPress, tone = 'default', showChevron = true, disabled = false, grouped = false, showDivider = false }) => {
  const isDanger = tone === 'danger';
  // Without onPress it's a plain information row (no tap feedback).
  const Container = onPress ? TouchableOpacity : View;
  const touchProps = onPress ? { onPress, disabled, activeOpacity: 0.7, accessibilityRole: 'button' } : {};
  return (
    <Container
      style={[styles.row, grouped && styles.grouped, showDivider && styles.divider, disabled && styles.disabled]}
      {...touchProps}
    >
      {icon ? (
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={icon} size={22} color={isDanger ? colors.danger : colors.primary} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text style={[styles.title, isDanger && styles.dangerText]} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {showChevron && onPress ? <Ionicons name="chevron-forward" size={20} color={colors.textOnSurfaceMuted} /> : null}
    </Container>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 64,
    ...shadows.sm,
  },
  grouped: {
    borderRadius: 0,
    marginBottom: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  text: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  dangerText: {
    color: colors.danger,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default ListRow;
