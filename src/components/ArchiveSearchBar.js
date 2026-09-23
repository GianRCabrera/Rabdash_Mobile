import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, radii, typography, shadow } from '../theme/theme';

// The search bar shared by every archive screen — previously copy-pasted 8
// times with an identical hardcoded placeholder ("Search by owner, pet
// name, or date...") even on forms with no owner or pet field at all
// (Budget, Schedule, Animal Control). Each screen now passes its own
// relevant placeholder.
const ArchiveSearchBar = ({ value, onChangeText, placeholder = 'Search records...' }) => (
  <View style={styles.container}>
    <Icon name="search" size={20} color={colors.textOnSurfaceMuted} style={styles.icon} />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textOnSurfaceMuted}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    marginBottom: spacing.lg,
    ...shadow,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
});

export default ArchiveSearchBar;
