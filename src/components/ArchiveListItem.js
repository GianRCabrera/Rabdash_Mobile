import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from './AppButton';
import FormSectionLabel from './FormSectionLabel';
import { colors, spacing, radii, typography, shadow } from '../theme/theme';

const FieldRow = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value === null || value === undefined || value === '' ? 'N/A' : value}</Text>
  </View>
);

// One record card for an archive screen's list — replaces 8 copies of a
// near-identical Text-stack + Edit/Delete button row. `fields` is a flat
// [{label, value}] list for most forms; `sections` (a list of {title,
// fields}) is for Rabies Exposure specifically, whose ~26 fields are
// conceptually grouped (Registration / History of Exposure / PEP / Tissue
// Culture Vaccine) — reuses FormSectionLabel for that grouping since the
// card is a white surface, the same context FormSectionLabel already
// assumes inside FormScreen.
const ArchiveListItem = ({ fields, sections, onEdit, onDelete }) => (
  <View style={styles.card}>
    {sections
      ? sections.map((section, index) => (
          <View key={section.title}>
            <FormSectionLabel title={section.title} first={index === 0} />
            {section.fields.map((field) => (
              <FieldRow key={field.label} {...field} />
            ))}
          </View>
        ))
      : fields.map((field) => <FieldRow key={field.label} {...field} />)}

    <View style={styles.actions}>
      <AppButton title="Edit" variant="secondary" onPress={onEdit} style={styles.actionButton} />
      <AppButton title="Delete" variant="danger" onPress={onDelete} style={styles.actionButton} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  fieldValue: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

export default ArchiveListItem;
