export const designSystem = {
  colors: {
    background: '#F5F7FA',
    card: '#FFFFFF',
    primary: '#087F5B',
    heading: '#183153',
    secondary: '#526477',
    highlight: '#E7F5EF',
    border: '#DCE3EB',
    positive: '#087F5B',
    negative: '#C62828',
    locked: '#526477',
    cyan: '#1769AA',
    gold: '#A15C00',
    violet: '#7250C7',
  },
  radius: { card: 14, control: 10, pill: 999 },
  spacing: { screen: 16, section: 12, compact: 8 },
  shadow: { color: '#183153', opacity: 0.08, radius: 12, elevation: 3 },
} as const;

export type DesignSystem = typeof designSystem;
export type DesignColors = typeof designSystem.colors;
