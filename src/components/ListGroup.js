import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radii, shadows } from '../theme/theme';

// One white card holding several ListRows, separated by thin dividers (the
// grouped style of a phone's Settings screen).
const ListGroup = ({ children, style }) => {
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.card, style]}>
      {rows.map((row, index) =>
        React.cloneElement(row, { grouped: true, showDivider: index < rows.length - 1 })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
});

export default ListGroup;
