import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import ScreenHeader from './ScreenHeader';
import { colors, spacing, typography } from '../theme/theme';

// Shared layout for the 8 archive/history screens (Field Vacc, Neuter,
// Sample, Animal Control, IEC, Schedule, Budget, Rabies Exposure archives):
// red background, the usual white-pill title, and a scrollable area for the
// search bar / record list / pagination. Replaces styles/Archive.js, whose
// loading spinner was hardcoded plain blue (#0000ff) instead of the brand
// color, and which had no empty-state handling at all — an empty result set
// just rendered a blank list with no messaging.
const ArchiveScreen = ({ title, loading, isEmpty, emptyMessage = 'No records found.', children }) => (
  <View style={styles.container}>
    <ScreenHeader title={title} />
    {loading ? (
      <ActivityIndicator size="large" color={colors.onPrimary} style={styles.loading} />
    ) : (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {children}
        {isEmpty ? <Text style={styles.emptyText}>{emptyMessage}</Text> : null}
      </ScrollView>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingTop: spacing.xxxl * 1.5,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  loading: {
    marginTop: spacing.xxxl,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.onPrimary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});

export default ArchiveScreen;
