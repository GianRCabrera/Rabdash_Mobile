import React, { useContext } from 'react';
import { View, Text, Image, Pressable, StatusBar, Platform, StyleSheet } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radii, typography, shadows } from '../theme/theme';

// The red bar at the top of every logged-in screen. It extends under the
// status bar (the app draws edge to edge), so it pads itself by the top
// safe-area inset. The inset comes from context rather than
// useSafeAreaInsets() so the header still renders (with a fallback inset)
// where no SafeAreaProvider exists, e.g. in tests.
const AppHeader = ({ title, subtitle, onBack, showBack = !!onBack, right, showLogo = false, variant = 'default' }) => {
  const navigation = useNavigation();
  const insets = useContext(SafeAreaInsetsContext);
  const topInset = insets ? insets.top : Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const handleBack = onBack || (() => navigation.goBack());

  // The home screen's header: left-aligned logo and name, the user's role as
  // a chip, and rounded bottom corners.
  if (variant === 'home') {
    return (
      <View style={[styles.homeBar, { paddingTop: topInset + spacing.lg }]}>
        <View style={styles.homeLogo}>
          <Image source={require('../../assets/logo.png')} style={styles.homeLogoImage} resizeMode="contain" />
        </View>
        <View style={styles.homeText}>
          <Text style={styles.homeTitle} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.homeTagline} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    );
  }

  return (
    <View style={[styles.bar, { paddingTop: topInset + spacing.md }]}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <Ionicons name="chevron-back" size={24} color={colors.onPrimary} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.center}>
        <View style={styles.titleRow}>
          {showLogo ? (
            <View style={styles.logoBadge}>
              <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            </View>
          ) : null}
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  homeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radii.md * 1.5,
    borderBottomRightRadius: radii.md * 1.5,
    ...shadows.md,
  },
  homeLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  homeLogoImage: {
    width: 36,
    height: 36,
  },
  homeText: {
    flex: 1,
  },
  homeTitle: {
    ...typography.title,
    color: colors.onPrimary,
  },
  homeTagline: {
    ...typography.body,
    color: colors.onPrimary,
    opacity: 0.85,
    marginTop: 2,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    minHeight: 56,
    ...shadows.md,
  },
  side: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  right: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logo: {
    width: 21,
    height: 21,
  },
  title: {
    ...typography.subtitle,
    color: colors.onPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.onPrimary,
    opacity: 0.85,
    marginTop: 2,
  },
});

export default AppHeader;
