import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../components';
import { colors, spacing, typography } from '../theme/theme';

// Solid red, matching Login/Register. One centered content group (not
// split top/bottom — that left one large, oddly empty gap in the middle,
// worse than the plain-centered version) — flexbox justifyContent:
// 'center' on a single group is symmetric by construction, so top and
// bottom margins match exactly regardless of screen height.
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
    paddingHorizontal: spacing.xxxl,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: spacing.xs,
  },
  header: {
    ...typography.largeTitle,
    color: colors.onPrimary,
    marginBottom: spacing.sm,
  },
  subheader: {
    ...typography.body,
    color: colors.onPrimary,
    textAlign: 'center',
    marginBottom: spacing.xxxl * 1.75,
    // Narrower than the full content width on purpose — shorter line
    // length means less side-to-side eye travel per line while reading.
    // 310 is calibrated to keep this exact sentence at 2 lines; if the
    // copy changes, re-check the line count.
    maxWidth: 310,
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
