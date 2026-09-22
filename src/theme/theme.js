// Single source of truth for the app's design tokens. Existing screens each
// hand-rolled their own colors/spacing/radii in styles/*.js, which drifted
// over ~2 years (10 different border-radius values, 7 font sizes with no
// real hierarchy, inconsistent shadows). This file keeps the one color that
// was actually consistent everywhere (#E74A3B, the brand red) and gives
// everything else a deliberate, reusable scale.

export const colors = {
  // Brand — unchanged from every existing screen.
  primary: '#E74A3B',
  primaryDark: '#C43A2D', // pressed/active state, derived from primary
  onPrimary: '#FFFFFF', // text/icons on top of primary

  // Neutrals — a handful of screens already reached for Tailwind's slate
  // scale (#4a5568, #1a202c) by hand; adopted properly here instead of
  // ad hoc.
  background: '#F7F7F8',
  surface: '#FFFFFF',
  border: '#E2E2E5',
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  textOnSurfaceMuted: '#8A8F98',
  textOnPrimary: '#FFFFFF',

  danger: '#D64545',
  success: '#2E9E5B',
};

// 4px base unit — every existing padding/margin value (5, 8, 10, 15, 20)
// roughly already fell near multiples of 4; this just makes it deliberate.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Replaces the 7 ad hoc font sizes (14/16/18/20/24/28/30) with a clear
// hierarchy. Weight is deliberately NOT bold-by-default here — the old
// styles used fontWeight: 'bold' on 38 of 39 weighted styles, which erases
// any visual hierarchy weight could otherwise carry.
export const typography = {
  caption: { fontSize: 12, fontWeight: '400' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyStrong: { fontSize: 15, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600' },
  subtitle: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700' },
  largeTitle: { fontSize: 28, fontWeight: '700' },
};

// Replaces the 5/7/8/10/15/20/25/30/45/85 grab-bag with three deliberate
// sizes: small controls, cards, and fully-rounded pills.
export const radii = {
  sm: 10, // inputs, small buttons, chips
  md: 16, // cards, modals
  pill: 999, // fully-rounded primary buttons
};

// A single consistent card shadow, used where the old styles sometimes had
// shadowColor/shadowOpacity/elevation and sometimes had none at all.
export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
};

const theme = { colors, spacing, typography, radii, shadow };
export default theme;
