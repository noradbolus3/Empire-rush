export const designSystem = {
  colors: {
    background: '#F7F8FA',
    card: '#FFFFFF',
    primary: '#2D8A72',
    heading: '#3B5064',
    secondary: '#6B7B8B',
    highlight: '#EEF7F3',
    border: '#E1E6EC',
    positive: '#2D8A72',
    negative: '#B85C62',
    locked: '#6B7B8B',
    cyan: '#4E82A8',
    gold: '#B27A32',
    violet: '#806FB0',
  },
  radius: { card: 14, control: 10, pill: 999 },
  spacing: { screen: 16, section: 12, compact: 8 },
  shadow: { color: '#728196', opacity: 0.06, radius: 12, elevation: 2 },
} as const;

export type DesignSystem = typeof designSystem;
export type DesignColors = typeof designSystem.colors;
