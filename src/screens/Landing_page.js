import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../components';
import { colors, spacing, radii, typography, shadow } from '../theme/theme';

const LandingPage = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {/* flex: 1 here, not a fixed height — the image fills whatever space
          is actually available above the card on this device, instead of a
          fixed-height image leaving a large empty gap on taller screens
          (what made the previous version feel like it was "floating"). */}
      <View style={styles.imageArea}>
        <Image source={require('../../assets/Landing_page.png')} style={styles.image} resizeMode="contain" />
      </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: radii.md * 2,
    borderTopRightRadius: radii.md * 2,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
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
