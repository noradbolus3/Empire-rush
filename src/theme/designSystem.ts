export const designSystem = {
  colors: {
    primaryNavy: '#101B2D',
    primaryBlue: '#1D4ED8',
    accentSkyBlue: '#38BDF8',
    surfaceLight: '#F8FAFC',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    border: '#D9E2EC',
    surfaceDark: '#172438',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    background: '#F8FAFC',
    card: '#FFFFFF',
    primary: '#1D4ED8',
    heading: '#0F172A',
    secondary: '#475569',
    highlight: '#EFF6FF',
    positive: '#16A34A',
    negative: '#DC2626',
    locked: '#475569',
    cyan: '#38BDF8',
    gold: '#D97706',
    violet: '#6D5BD0',
  },
  radius: { card: 14, control: 10, pill: 999 },
  spacing: { screen: 16, section: 12, compact: 8 },
  shadow: { color: '#728196', opacity: 0.06, radius: 12, elevation: 2 },
} as const;

export type DesignSystem = typeof designSystem;
export type DesignColors = typeof designSystem.colors;
