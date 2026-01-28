import { ConfigProvider, theme as antdTheme } from 'antd'
import { ReactNode } from 'react'
import { antdTheme as customAntdTheme } from '../theme'

interface AntdProviderProps {
  children: ReactNode
  theme?: typeof customAntdTheme
}

export function AntdProvider({ children, theme = customAntdTheme }: AntdProviderProps) {
  return <ConfigProvider theme={theme}>{children}</ConfigProvider>
}
