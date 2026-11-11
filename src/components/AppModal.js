import React from 'react';
import { Modal, Pressable, View, Text, StyleSheet } from 'react-native';
import AppButton from './AppButton';
import { colors, spacing, radii, typography } from '../theme/theme';

// Built on React Native's own Modal rather than react-native-modal: that
// library calls InteractionManager (removed in RN 0.88) and crashes on show.
// Same isVisible/onBackdropPress props it had, so callers didn't change.
// Android's hardware back button maps to onBackdropPress too.
export const ModalShell = ({ isVisible, onBackdropPress, children }) => (
  <Modal visible={!!isVisible} transparent animationType="fade" onRequestClose={onBackdropPress} statusBarTranslucent>
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onBackdropPress} />
      {children}
    </View>
  </Modal>
);

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
    <ModalShell isVisible={isVisible} onBackdropPress={onBackdropPress}>
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
    </ModalShell>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.overlay,
  },
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
