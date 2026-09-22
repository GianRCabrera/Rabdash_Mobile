import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../components';
import { colors, spacing, radii, typography, shadow } from '../theme/theme';

const LandingPage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image source={require('../../assets/Landing_page.png')} style={styles.image} resizeMode="contain" />

      <View style={styles.card}>
        <Text style={styles.header}>Rabdash DC</Text>
        <Text style={styles.subheader}>
          Leveraging data and research to assist in achieving a rabies-free Davao City by 2030.
        </Text>
        <View style={styles.buttonRow}>
          <AppButton title="Login" onPress={() => navigation.navigate('Login')} variant="inverse" style={styles.button} />
          <AppButton title="Sign Up" onPress={() => navigation.navigate('Register')} variant="inverse" style={styles.button} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  image: {
    width: '80%',
    height: 220,
    marginBottom: spacing.xxl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    ...shadow,
    shadowOpacity: 0.15,
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
    marginBottom: spacing.xl,
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
