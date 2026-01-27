import type { Position as ApiPosition } from '@restaurant-pos/api-client'

export interface PositionTable {
  number: number
  id: string
  name: string
  permissions: string
  created_at: string
  updated_at: string
}

export interface PositionsSort {
  field: keyof PositionTable
  direction: 'asc' | 'desc'
}
