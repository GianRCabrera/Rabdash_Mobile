import React from 'react';
import { Text, ActivityIndicator, StyleSheet } from 'react-native';
import Screen from './Screen';
import { colors, spacing, typography } from '../theme/theme';

// Shared layout for the 8 archive/history screens: the red header (with a
// back chevron) over the light background, then the search bar / record
// cards / pagination, a spinner while loading, and an empty-state message.
const ArchiveScreen = ({ title, loading, isEmpty, emptyMessage = 'No records found.', onBack, children }) => (
  <Screen title={title} onBack={onBack} showBack>
    {loading ? (
      <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
    ) : (
      <>
        {children}
        {isEmpty ? <Text style={styles.emptyText}>{emptyMessage}</Text> : null}
      </>
    )}
  </Screen>
);

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});

export default ArchiveScreen;
