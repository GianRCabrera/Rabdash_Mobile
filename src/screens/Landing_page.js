import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../components';
import { colors, spacing, typography } from '../theme/theme';

// Solid red background, matching Login/Register/every other pre-auth
// screen, instead of the previous white-top/red-card-bottom split. That
// split is what made empty space read as "floating" — a two-tone layout
// makes any gap look like a mistake, where a single uniform background
// reads as intentional even when content doesn't fill the exact center
// (this is exactly how LoginPage.js already works with no such complaint).
// Also swaps the standalone illustration (a boxy asset with its own
// baked-in light background, sitting oddly on red) for the same logo
// already used on Login/Register, so first launch -> login feels like one
// continuous flow instead of a visually different screen.
const LandingPage = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.header}>Rabdash DC</Text>
        <Text style={styles.subheader}>
          Leveraging data and research to assist in achieving a rabies-free Davao City by 2030.
        </Text>

        <View style={styles.buttonRow}>
          <AppButton title="Login" onPress={() => navigation.navigate('Login')} variant="inverse" style={styles.button} />
          <AppButton title="Sign Up" onPress={() => navigation.navigate('Register')} variant="inverse" style={styles.button} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: spacing.lg,
  },
  header: {
    ...typography.largeTitle,
    color: colors.onPrimary,
    marginBottom: spacing.lg,
  },
  subheader: {
    ...typography.body,
    color: colors.onPrimary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
  },
});

export default LandingPage;
