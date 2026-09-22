import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import AppButton from './AppButton';
import { colors, spacing, radii, typography } from '../theme/theme';

// Every screen hand-rolled its own modal container (padding/radius varied:
// 5, 10, 15, 20 depending on the file) for what's really always one of two
// shapes: a message with a single OK button, or a message with two
// confirm/cancel buttons. `actions` covers both; pass `children` instead of
// `message` for anything more custom (e.g. an OTP input field inside a
// modal) while still getting the consistent container styling.
//
// actions: [{ label, onPress, variant }] — variant defaults to 'primary'
// for a single action, or 'secondary'/'primary' for the first/last of two.
const AppModal = ({ isVisible, message, children, actions, onBackdropPress }) => {
  const resolvedActions =
    actions ||
    (message ? [{ label: 'OK', onPress: onBackdropPress, variant: 'primary' }] : []);

  return (
    <Modal isVisible={isVisible} onBackdropPress={onBackdropPress}>
      <View style={styles.container}>
        {children ? children : <Text style={styles.message}>{message}</Text>}
        {resolvedActions.length > 0 && (
          <View style={styles.actions}>
            {resolvedActions.map((action, index) => (
              <AppButton
                key={action.label}
                title={action.label}
                onPress={action.onPress}
                variant={action.variant || (resolvedActions.length > 1 && index === 0 ? 'secondary' : 'primary')}
                style={resolvedActions.length > 1 ? styles.actionHalf : styles.actionFull}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  message: {
    ...typography.subtitle,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
  },
  actionFull: {
    flex: 1,
  },
  actionHalf: {
    flex: 1,
  },
});

export default AppModal;
