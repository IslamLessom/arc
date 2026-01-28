import { ThemeConfig } from 'antd'

// Color palette based on the design system
export const colors = {
  // Background colors
  background: '#ffffff',
  backgroundHover: '#f8fafc',
  backgroundActive: '#f1f5f9',

  // Text colors
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',

  // Primary colors (Blue)
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  primaryActive: '#1d4ed8',

  // Accent colors (Blue)
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  accentHover: '#2563eb',
  accentBackground: '#eff6ff',

  // Border colors
  border: '#e2e8f0',
  borderHover: '#cbd5e1',
  borderLight: '#f1f5f9',

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  // Common colors
  white: '#ffffff',
  black: '#000000',

  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowStrong: 'rgba(0, 0, 0, 0.25)',

  // Dark mode theme (existing)
  darkBackground: '#1a1d29',
  darkBackgroundHover: '#1e2230',
  darkBackgroundActive: '#222736',
  darkTextPrimary: '#f0f2f5',
  darkTextSecondary: '#a0a8b8',
  darkBorder: 'rgba(255, 255, 255, 0.08)',
  darkBorderHover: 'rgba(255, 255, 255, 0.12)',
} as const

export type ColorPalette = typeof colors

// Ant Design theme configuration
export const antdTheme: ThemeConfig = {
  token: {
    // Primary colors
    colorPrimary: colors.primary,
    colorPrimaryHover: colors.primaryHover,
    colorPrimaryActive: colors.primaryActive,

    // Success colors
    colorSuccess: colors.success,

    // Warning colors
    colorWarning: colors.warning,

    // Error colors
    colorError: colors.danger,

    // Info colors
    colorInfo: colors.info,

    // Background
    colorBgBase: colors.background,
    colorBgContainer: colors.background,
    colorBgElevated: colors.white,
    colorBgLayout: '#f8fafc',

    // Border
    colorBorder: colors.border,
    colorBorderSecondary: colors.borderHover,

    // Text
    colorText: colors.textPrimary,
    colorTextSecondary: colors.textSecondary,
    colorTextTertiary: colors.textMuted,
    colorTextQuaternary: colors.textMuted,

    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // Font
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      paddingInline: 20,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      paddingInline: 16,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Table: {
      borderRadiusLG: 12,
      headerBg: colors.background,
      headerColor: colors.textPrimary,
    },
    Modal: {
      borderRadiusLG: 12,
    },
    Card: {
      borderRadiusLG: 12,
    },
  },
}

// Styled Components theme
export interface StyledTheme {
  colors: ColorPalette
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    xxl: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
  transitions: {
    fast: string
    normal: string
    slow: string
  }
}

export const styledTheme: StyledTheme = {
  colors,
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
  },
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  },
}

// Default export
export default styledTheme
