import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from './AppButton';
import { colors, spacing, typography } from '../theme/theme';

// Shared Prev/Next + page-number control for the archive screens' manual
// client-side pagination.
const ArchivePagination = ({ page, totalPages, onPrev, onNext }) => (
  <View style={styles.container}>
    <AppButton
      title="Prev"
      variant="ghost"
      onPress={onPrev}
      disabled={page <= 1}
      style={styles.button}
      textStyle={styles.buttonText}
    />
    <Text style={styles.pageText}>
      Page {page} of {Math.max(totalPages, 1)}
    </Text>
    <AppButton
      title="Next"
      variant="ghost"
      onPress={onNext}
      disabled={page >= totalPages}
      style={styles.button}
      textStyle={styles.buttonText}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  button: {
    borderWidth: 1.5,
    borderColor: colors.onPrimary,
  },
  buttonText: {
    color: colors.onPrimary,
  },
  pageText: {
    ...typography.bodyStrong,
    color: colors.onPrimary,
  },
});

export default ArchivePagination;
