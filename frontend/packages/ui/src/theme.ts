export const colors = {
  // Background colors
  background: '#1a1d29',
  backgroundHover: '#1e2230',
  backgroundActive: '#222736',

  // Text colors
  textPrimary: '#f0f2f5',
  textSecondary: '#a0a8b8',
  textMuted: '#6b7280',

  // Accent colors
  accent: '#6366f1',
  accentLight: '#818cf8',
  accentHover: '#4f46e5',
  accentBackground: 'rgba(99, 102, 241, 0.12)',

  // Border and shadow colors
  border: 'rgba(255, 255, 255, 0.08)',
  borderHover: 'rgba(255, 255, 255, 0.12)',
  shadow: 'rgba(0, 0, 0, 0.3)',

  // Common colors
  white: '#ffffff',
  danger: '#ef4444',
} as const;

export type ColorPalette = typeof colors;