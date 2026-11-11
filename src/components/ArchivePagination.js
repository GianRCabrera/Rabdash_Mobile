import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from './AppButton';
import { colors, spacing, typography } from '../theme/theme';

// Shared Prev/Next + page-number control for the archive screens' manual
// pagination. Takes hasPrev/hasNext directly rather than a computed
// totalPages, since not every screen knows its total up front — Field Vacc
// Archive fetches pages incrementally from the server and only knows
// whether a next page might exist (as many records as the current page
// size), not a real total.
const ArchivePagination = ({ page, hasPrev, hasNext, onPrev, onNext }) => (
  <View style={styles.container}>
    <AppButton
      title="Prev"
      variant="secondary"
      onPress={onPrev}
      disabled={!hasPrev}
      style={styles.button}
      textStyle={styles.buttonText}
    />
    <Text style={styles.pageText}>Page {page}</Text>
    <AppButton
      title="Next"
      variant="secondary"
      onPress={onNext}
      disabled={!hasNext}
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
    minWidth: 96,
  },
  buttonText: {},
  pageText: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
  },
});

export default ArchivePagination;
