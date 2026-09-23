import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppButton, AppCard, ScreenHeader, menuStyles } from '../components';
import { colors, spacing, typography, radii } from '../theme/theme';

const UserProfile = () => {
  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL || 'http://localhost:3000';
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`${apiURL}/userProfile`)
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
      });
  }, [apiURL]);

  const handleBackToMainMenu = () => {
    if (user && user.position) {
      switch (user.position) {
        case 'CVO':
        case 'RabDash':
          navigation.navigate('VetMenu');
          break;
        case 'Private Veterinarian':
          navigation.navigate('MainMenu');
          break;
        default:
          console.warn('Unknown user position:', user.position);
      }
    } else {
      console.warn('User position is undefined');
    }
  };

  const handleResetPassword = () => {
    navigation.navigate('ResetPasswordPage', { email: user.email, previousScreen: 'UserProfile' });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="User Profile" />

        {user ? (
          <AppCard style={styles.card}>
            <Image source={require('../../assets/avatar.png')} style={styles.avatar} />
            <Text style={styles.name}>{`${user.name || ''} ${user.last_name || ''}`}</Text>

            <View style={styles.infoRow}>
              <Icon name="person" size={20} color={colors.primary} style={styles.icon} />
              <Text style={styles.infoText}>{user.name || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="person-outline" size={20} color={colors.primary} style={styles.icon} />
              <Text style={styles.infoText}>{user.last_name || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="email" size={20} color={colors.primary} style={styles.icon} />
              <Text style={styles.infoText}>{user.email || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="work" size={20} color={colors.primary} style={styles.icon} />
              <Text style={styles.infoText}>{user.position || 'N/A'}</Text>
            </View>

            <AppButton title="Reset Password" variant="primary" onPress={handleResetPassword} style={styles.resetButton} />
          </AppCard>
        ) : (
          <ActivityIndicator size="large" color={colors.onPrimary} style={styles.loading} />
        )}

        <AppButton
          title="Main Menu"
          variant="ghost"
          onPress={handleBackToMainMenu}
          style={menuStyles.backButton}
          textStyle={menuStyles.backButtonText}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingTop: spacing.xxxl * 1.5,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  card: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: radii.pill,
    marginBottom: spacing.md,
  },
  name: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  resetButton: {
    width: '100%',
    marginTop: spacing.lg,
  },
  loading: {
    marginTop: spacing.xxxl,
  },
});

export default UserProfile;
