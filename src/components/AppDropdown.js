import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { colors, spacing, radii, typography, shadow } from '../theme/theme';

// Wraps react-native-dropdown-picker with the same border/radius/shadow as
// AppInput. Always renders with listMode="SCROLLVIEW" — a known
// dropdown-in-ScrollView clipping bug elsewhere in the app means the
// absolute-positioned overlay mode isn't safe to use inside a form's
// ScrollView, so every form screen already relied on SCROLLVIEW mode before
// this component existed; keep doing that instead of reintroducing the bug.
//
// SCROLLVIEW mode changes how the list's own contents scroll, but the open
// list itself is still rendered as an absolutely-positioned overlay that
// does NOT push later siblings down — whichever field comes after this one
// in the form just paints over it, since React Native's default paint order
// is later-sibling-on-top. Raising this container's zIndex while open fixes
// a dropdown against a later plain sibling; when two dropdowns are paired
// side-by-side in a row, the row wrapper itself also needs the same
// escalation (its zIndex, not just the dropdown's, since the dropdown can't
// "escape" its parent row's own stacking position) — see the row usages in
// the Rabies Field Vacc/Sample Info/Exposure form screens.
const AppDropdown = ({ label, open, value, items, setOpen, setValue, placeholder, ...rest }) => (
  <View style={[styles.container, open && styles.containerOpen]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      placeholder={placeholder}
      listMode="SCROLLVIEW"
      style={styles.picker}
      textStyle={styles.pickerText}
      dropDownContainerStyle={styles.dropdownContainer}
      placeholderStyle={styles.placeholder}
      {...rest}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.lg,
    zIndex: 1,
  },
  containerOpen: {
    zIndex: 20,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  picker: {
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.sm,
    minHeight: 52,
    ...shadow,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  pickerText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  dropdownContainer: {
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.sm,
  },
  placeholder: {
    color: colors.textOnSurfaceMuted,
  },
});

export default AppDropdown;
