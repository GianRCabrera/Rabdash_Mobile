import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ScreenHeader from './ScreenHeader';
import { colors, spacing, radii, typography } from '../theme/theme';

// Shared layout for the field-report form screens (Budget, Schedule, IEC,
// and the rest of the form-domain family): a red background, the usual
// white-pill title, and a white scrollable card for the fields. Replaces
// styles/submitforms3.js's per-screen headerContainer/whiteContainer pair,
// which had three near-identical copies (headerContainer,
// headerContainersched, headerContainerIEC) differing only in a hardcoded
// paddingHorizontal tuned to that one screen's title length.
const FormScreen = ({ title, children }) => (
  <View style={styles.container}>
    <ScreenHeader title={title} />
    <View style={styles.card}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Input "N/A" if information is unavailable</Text>
        </View>
        {children}
      </ScrollView>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingTop: spacing.xxxl * 1.5,
    paddingHorizontal: spacing.xl,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  notice: {
    backgroundColor: colors.success,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  noticeText: {
    ...typography.bodyStrong,
    color: colors.onPrimary,
  },
});

export default FormScreen;
