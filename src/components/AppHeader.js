import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform, StyleSheet } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, typography, shadows } from '../theme/theme';

// The red bar at the top of every logged-in screen. It extends under the
// status bar (the app draws edge to edge), so it pads itself by the top
// safe-area inset. The inset comes from context rather than
// useSafeAreaInsets() so the header still renders (with a fallback inset)
// where no SafeAreaProvider exists, e.g. in tests.
const AppHeader = ({ title, subtitle, onBack, showBack = !!onBack, right }) => {
  const navigation = useNavigation();
  const insets = useContext(SafeAreaInsetsContext);
  const topInset = insets ? insets.top : Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const handleBack = onBack || (() => navigation.goBack());

  return (
    <View style={[styles.bar, { paddingTop: topInset + spacing.md }]}>
      <View style={styles.side}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={26} color={colors.onPrimary} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    ...shadows.md,
  },
  side: {
    width: 32,
  },
  right: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
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
