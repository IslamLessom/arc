import type { Transaction, Account } from '@restaurant-pos/types'

export type CashFlowRowType = 'income' | 'expense' | 'startBalance' | 'endBalance' | 'netCashFlow' | 'transfer'

export interface CashFlowRow {
  id: string
  type: CashFlowRowType
  label: string
  level: 0 | 1 // 0 = main category, 1 = sub-item
  parentId?: string
  isExpanded?: boolean
}

export interface MonthData {
  year: number
  month: number // 1-12
  label: string // e.g., "Декабрь 2025"
}

export interface CashFlowFilters {
  accountIds: string[]
  startDate: Date
  endDate: Date
}

export interface CategoryTotals {
  income: Map<string, number> // category -> total
  expense: Map<string, number>
  startBalance: Map<string, number> // accountId -> balance
}

export interface AccountBalance {
  accountId: string
  accountName: string
  balance: number
}

export interface MonthlyCashFlow {
  month: MonthData
  income: Map<string, number> // category -> total
  expense: Map<string, number>
  transfers: Map<string, number> // category -> total (не влияет на чистый поток)
  startBalances: AccountBalance[]
  endBalances: AccountBalance[]
  netCashFlow: number
}
