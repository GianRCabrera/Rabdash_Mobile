import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from '@expo/vector-icons/MaterialIcons';
import { AppButton, AppCard, Screen } from '../components';
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

  const handleResetPassword = () => {
    navigation.navigate('ResetPasswordPage', { email: user.email, previousScreen: 'UserProfile' }, { pop: true });
  };

  return (
    <Screen title="My Profile" showBack>

        {user ? (
          <AppCard style={styles.card}>
            <Image source={require('../../assets/avatar.png')} style={styles.avatar} />
            <Text style={styles.name}>{`${user.name || ''} ${user.last_name || ''}`}</Text>

            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Icon name="person" size={20} color={colors.primary} style={styles.icon} />
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>First Name</Text>
                  <Text style={styles.infoValue}>{user.name || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Icon name="person-outline" size={20} color={colors.primary} style={styles.icon} />
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Last Name</Text>
                  <Text style={styles.infoValue}>{user.last_name || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Icon name="email" size={20} color={colors.primary} style={styles.icon} />
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user.email || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Icon name="work" size={20} color={colors.primary} style={styles.icon} />
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Position</Text>
                  <Text style={styles.infoValue}>{user.position || 'N/A'}</Text>
                </View>
              </View>
            </View>

            <AppButton title="Reset Password" variant="primary" onPress={handleResetPassword} style={styles.resetButton} />
          </AppCard>
        ) : (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
        )}

    </Screen>
  );
};

const styles = StyleSheet.create({
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
  infoList: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  icon: {
    marginRight: spacing.md,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    marginTop: spacing.xs / 2,
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
