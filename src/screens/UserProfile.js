import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { AppButton, ListGroup, ListRow, Screen, SectionTitle } from '../components';
import { colors, spacing, typography, radii, shadows } from '../theme/theme';

const initialsOf = (user) =>
  [user.name, user.last_name]
    .map((part) => (part || '').trim().charAt(0))
    .join('')
    .toUpperCase() || (user.email || '?').charAt(0).toUpperCase();

const UserProfile = () => {
  const navigation = useNavigation();
  const apiURL = process.env.EXPO_PUBLIC_URL || 'http://localhost:3000';
  const [user, setUser] = useState(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    setFailed(false);
    axios
      .get(`${apiURL}/userProfile`)
      .then((response) => setUser(response.data))
      .catch((error) => {
        console.error('Error fetching user profile:', error);
        setFailed(true);
      });
  }, [apiURL]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChangePassword = () => {
    navigation.navigate('ResetPasswordPage', { email: user.email, previousScreen: 'UserProfile' }, { pop: true });
  };

  const fullName = user ? `${user.name || ''} ${user.last_name || ''}`.trim() : '';

  return (
    <Screen title="My Profile" showBack>
      {user ? (
        <>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialsOf(user)}</Text>
            </View>
            <Text style={styles.name}>{fullName || user.email}</Text>
            {user.position ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{user.position}</Text>
              </View>
            ) : null}
          </View>

          <SectionTitle title="Details" first />
          <ListGroup>
            <ListRow icon="account-outline" title={fullName || 'N/A'} subtitle="Name" />
            <ListRow icon="email-outline" title={user.email || 'N/A'} subtitle="Email" />
            <ListRow icon="briefcase-outline" title={user.position || 'N/A'} subtitle="Position" />
          </ListGroup>

          <SectionTitle title="Security" />
          <ListGroup>
            <ListRow icon="lock-reset" title="Change password" subtitle="Requires your current password" onPress={handleChangePassword} />
          </ListGroup>
        </>
      ) : failed ? (
        <View style={styles.message}>
          <Text style={styles.messageText}>Couldn't load your profile. Check your connection and try again.</Text>
          <AppButton title="Try again" variant="secondary" onPress={load} style={styles.retry} />
        </View>
      ) : (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.title,
    color: colors.primary,
  },
  name: {
    ...typography.subtitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  chip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  chipText: {
    ...typography.label,
    color: colors.primary,
  },
  loading: {
    marginTop: spacing.xxxl,
  },
  message: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  messageText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retry: {
    marginTop: spacing.lg,
    minWidth: 160,
  },
});

export default UserProfile;
