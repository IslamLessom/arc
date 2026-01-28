/// <reference types="vite/client" />

import 'styled-components'
import { StyledTheme } from '@restaurant-pos/ui'

declare module 'styled-components' {
  export interface DefaultTheme extends StyledTheme {}
}


