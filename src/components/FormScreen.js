import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ScreenHeader from './ScreenHeader';
import { colors, spacing, radii, typography } from '../theme/theme';

// Shared layout for the field-report form screens (Budget, Schedule, IEC,
// and the rest of the form-domain family): a red background, the usual
// white-pill title (always visible, outside the scroll area), and a white
// card for the fields. Replaces styles/submitforms3.js's per-screen
// headerContainer/whiteContainer pair, which had three near-identical
// copies (headerContainer, headerContainersched, headerContainerIEC)
// differing only in a hardcoded paddingHorizontal tuned to that one
// screen's title length.
//
// The card is the ScrollView's contentContainerStyle, not a separate
// flex:1 wrapper around the ScrollView — that distinction matters: a
// flex:1 wrapper forces the white box to fill the remaining screen height
// regardless of how many fields it holds, which left a large empty white
// void inside the card on short forms (e.g. Budget's 3 fields). Sizing the
// card to its own content lets it end naturally after the last field/button
// on short forms, while the ScrollView (bounded by its own flex:1) still
// scrolls normally once a longer form's content exceeds the screen.
const FormScreen = ({ title, children }) => (
  <View style={styles.container}>
    <ScreenHeader title={title} />
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.card} showsVerticalScrollIndicator={false}>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>Input "N/A" if information is unavailable</Text>
      </View>
      {children}
    </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
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
