import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { ReactNode } from 'react'
import { styledTheme, StyledTheme } from '../theme'

interface ThemeProviderProps {
  children: ReactNode
  theme?: StyledTheme
}

export function ThemeProvider({ children, theme = styledTheme }: ThemeProviderProps) {
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
}
