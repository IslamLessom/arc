import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetTransactions, useGetAccounts } from '@restaurant-pos/api-client'
import type { Transaction, Account } from '@restaurant-pos/types'
import type { CashFlowRow, MonthData, MonthlyCashFlow } from '../lib/types'
import {
  generateMonths,
  groupTransactionsByMonth,
  calculateMonthlyCashFlow,
  buildCashFlowRows,
  getRowValue,
  getTotalValue
} from '../lib/cashFlowUtils'

interface UseCashFlowParams {
  monthCount?: number
}

export function useCashFlow(params?: UseCashFlowParams) {
  const navigate = useNavigate()
  const MONTH_COUNT = params?.monthCount || 3

  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['income', 'expense', 'startBalance', 'endBalance']))
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - MONTH_COUNT + 1)
    date.setDate(1)
    return date
  })
  const [endDate, setEndDate] = useState<Date>(() => new Date())

  // Generate month columns
  const months = useMemo(() => generateMonths(startDate, endDate), [startDate, endDate])

  // Format dates for API
  const startDateStr = useMemo(() => startDate.toISOString().split('T')[0], [startDate])
  const endDateStr = useMemo(() => endDate.toISOString().split('T')[0], [endDate])

  // Fetch transactions for the period
  const { data: transactions = [], isLoading: transactionsLoading } = useGetTransactions({
    startDate: startDateStr,
    endDate: endDateStr
  })

  // Fetch accounts
  const { data: accounts = [], isLoading: accountsLoading } = useGetAccounts(undefined, true)

  const isLoading = transactionsLoading || accountsLoading

  // Calculate monthly cash flow data
  const monthlyData = useMemo<MonthlyCashFlow[]>(() => {
    if (!transactions.length || !accounts.length) return []

    const result: MonthlyCashFlow[] = []
    let previousEndBalances = months[0] ? calculateInitialBalances(accounts, months[0], transactions) : []

    months.forEach((month, index) => {
      const monthData = calculateMonthlyCashFlow(transactions, month, accounts, previousEndBalances)
      result.push(monthData)
      previousEndBalances = monthData.endBalances
    })

    return result
  }, [transactions, accounts, months])

  // Build rows structure
  const rows = useMemo<CashFlowRow[]>(() => {
    if (!accounts.length) return []
    return buildCashFlowRows(accounts, monthlyData, transactions)
  }, [accounts, monthlyData, transactions])

  // Filter accounts based on selection
  const filteredAccounts = useMemo(() => {
    if (selectedAccountIds.length === 0) return accounts
    return accounts.filter(a => selectedAccountIds.includes(a.id))
  }, [accounts, selectedAccountIds])

  // Toggle row expansion
  const toggleRowExpansion = useCallback((rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }, [])

  // Check if row is visible (considering parent expansion)
  const isRowVisible = useCallback((row: CashFlowRow): boolean => {
    if (row.level === 0) return true
    if (!row.parentId) return true
    return expandedRows.has(row.parentId)
  }, [expandedRows])

  // Get cell value for a row and month
  const getCellValue = useCallback((row: CashFlowRow, monthIndex: number): number => {
    return getRowValue(row, monthIndex, monthlyData, filteredAccounts)
  }, [monthlyData, filteredAccounts])

  // Get total value for a row across all months
  const getTotalForRow = useCallback((row: CashFlowRow): number => {
    return getTotalValue(row, monthlyData, filteredAccounts)
  }, [monthlyData, filteredAccounts])

  const handleBack = () => {
    navigate('/finance')
  }

  const handleExport = () => {
    console.log('Export clicked')
    // TODO: Implement export
  }

  const handlePrint = () => {
    console.log('Print clicked')
    // TODO: Implement print
  }

  const handleAccountToggle = useCallback((accountId: string) => {
    setSelectedAccountIds(prev => {
      if (prev.includes(accountId)) {
        return prev.filter(id => id !== accountId)
      } else {
        return [...prev, accountId]
      }
    })
  }, [])

  const handleDateChange = useCallback((newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
  }, [])

  return {
    // State
    isLoading,
    months,
    rows,
    accounts: filteredAccounts,
    expandedRows,
    selectedAccountIds,
    startDate,
    endDate,
    monthlyData,

    // Actions
    toggleRowExpansion,
    isRowVisible,
    getCellValue,
    getTotalForRow,
    handleBack,
    handleExport,
    handlePrint,
    handleAccountToggle,
    handleDateChange
  }
}

function calculateInitialBalances(accounts: Account[], firstMonth: MonthData, transactions: Transaction[]) {
  // Calculate balances before the first month
  const firstMonthDate = new Date(firstMonth.year, firstMonth.month - 1, 1)

  return accounts.map(account => ({
    accountId: account.id,
    accountName: account.name,
    balance: account.balance // This should be calculated from transactions before the period
  }))
}
