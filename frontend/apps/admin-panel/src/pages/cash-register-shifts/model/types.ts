import type { Shift } from '@restaurant-pos/types'

export interface CashRegisterShiftTable extends Shift {
  number: number
  // Вычисляемые поля для таблицы
  isOpen: boolean
  inCash: number
  difference: number
}

export interface CashRegisterShiftsFilter {
  status?: 'open' | 'closed'
  establishmentId?: string
  employeeId?: string
  startDate?: string
  endDate?: string
  searchQuery?: string
}

export interface CashRegisterShiftsFormData {
  establishmentId: string
  employeeId: string
  openingBalance: number
  closingBalance?: number
}
