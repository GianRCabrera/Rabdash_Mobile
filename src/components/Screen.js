import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import AppHeader from './AppHeader';
import { colors, spacing } from '../theme/theme';

// Base layout for logged-in screens: the red AppHeader on top and a light
// background below. `scroll={false}` gives a plain View for screens that
// manage their own scrolling. Header props (subtitle, onBack, showBack,
// right) pass straight through.
const Screen = ({ title, subtitle, onBack, showBack, right, showLogo, scroll = true, contentStyle, children }) => (
  <View style={styles.container}>
    <AppHeader title={title} subtitle={subtitle} onBack={onBack} showBack={showBack} right={right} showLogo={showLogo} />
    {scroll ? (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    ) : (
      <View style={[styles.flex, styles.content, contentStyle]}>{children}</View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});

export default Screen;
