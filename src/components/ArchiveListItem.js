import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppButton from './AppButton';
import FormSectionLabel from './FormSectionLabel';
import { colors, spacing, radii, typography, shadow } from '../theme/theme';

const FieldRow = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value === null || value === undefined || value === '' ? 'N/A' : value}</Text>
  </View>
);

// One record card for an archive screen's list — collapsed by default to a
// `title`/`subtitle` summary row (the record's most identifying fields,
// e.g. owner name + date), expanding on tap to show every field plus
// Edit/Delete. Without this, records with 20+ fields (Field Vacc, Rabies
// Exposure) turned browsing the list into endless scrolling past fields you
// didn't need just to find the next record.
//
// `fields` is a flat [{label, value}] list for most forms; `sections` (a
// list of {title, fields}) is for Rabies Exposure specifically, whose ~26
// fields are conceptually grouped (Registration / History of Exposure /
// PEP / Tissue Culture Vaccine) — reuses FormSectionLabel for that
// grouping since the card is a white surface, the same context
// FormSectionLabel already assumes inside FormScreen.
const ArchiveListItem = ({ title, subtitle, fields, sections, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          ) : null}
        </View>
        <Icon name={expanded ? 'expand-less' : 'expand-more'} size={26} color={colors.textSecondary} />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    ...shadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  headerText: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
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
