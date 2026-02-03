import type { Transaction, Account } from '@restaurant-pos/types'
import type { CashFlowRow, MonthData, MonthlyCashFlow, AccountBalance } from './types'

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

export function generateMonths(startDate: Date, endDate: Date): MonthData[] {
  const months: MonthData[] = []
  const current = new Date(startDate)
  current.setDate(1) // Set to first day of month

  while (current <= endDate) {
    months.push({
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      label: `${MONTH_NAMES[current.getMonth()]} ${current.getFullYear()}`
    })
    current.setMonth(current.getMonth() + 1)
  }

  return months
}

export function groupTransactionsByMonth(
  transactions: Transaction[],
  months: MonthData[]
): Map<string, Transaction[]> {
  const monthlyMap = new Map<string, Transaction[]>()

  months.forEach(month => {
    const key = `${month.year}-${month.month}`
    monthlyMap.set(key, [])
  })

  transactions.forEach(transaction => {
    const date = new Date(transaction.transactionDate)
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`
    const monthTransactions = monthlyMap.get(key)
    if (monthTransactions) {
      monthTransactions.push(transaction)
    }
  })

  return monthlyMap
}

export function calculateMonthlyCashFlow(
  transactions: Transaction[],
  month: MonthData,
  accounts: Account[],
  previousMonthEndBalances?: AccountBalance[]
): MonthlyCashFlow {
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.transactionDate)
    return date.getFullYear() === month.year && date.getMonth() + 1 === month.month
  })

  // Group income by category (исключаем трансферы между своими счетами)
  const income = new Map<string, number>()
  monthTransactions
    .filter(t => t.type === 'income')
    .forEach(t => {
      const category = t.category || 'Без категории'
      income.set(category, (income.get(category) || 0) + t.amount)
    })

  // Group expenses by category (исключаем трансферы между своими счетами)
  const expense = new Map<string, number>()
  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const category = t.category || 'Без категории'
      expense.set(category, (expense.get(category) || 0) + t.amount)
    })

  // Отдельно учитываем трансферы для корректного расчета балансов
  // но НЕ включаем их в income/expense для чистого денежного потока
  const transfers = new Map<string, number>()
  monthTransactions
    .filter(t => t.type === 'transfer')
    .forEach(t => {
      const category = t.category || 'Переводы между счетами'
      transfers.set(category, (transfers.get(category) || 0) + t.amount)
    })

  // Calculate start balances
  const startBalances: AccountBalance[] = accounts.map(account => ({
    accountId: account.id,
    accountName: account.name,
    balance: previousMonthEndBalances?.find(b => b.accountId === account.id)?.balance || account.balance
  }))

  // Calculate total income and expenses
  const totalIncome = Array.from(income.values()).reduce((sum, val) => sum + val, 0)
  const totalExpense = Array.from(expense.values()).reduce((sum, val) => sum + val, 0)

  // Calculate end balances
  const endBalances: AccountBalance[] = startBalances.map(startBalance => {
    const accountTransactions = monthTransactions.filter(t => t.accountId === startBalance.accountId)
    const accountIncome = accountTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const accountExpense = accountTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    // Трансферы: учитываем только трансферы НА этот счет (тип transfer)
    const transferIn = accountTransactions.filter(t => t.type === 'transfer').reduce((sum, t) => sum + t.amount, 0)

    return {
      accountId: startBalance.accountId,
      accountName: startBalance.accountName,
      balance: startBalance.balance + accountIncome - accountExpense + transferIn
    }
  })

  const netCashFlow = totalIncome - totalExpense // Трансферы НЕ влияют на чистый поток

  return {
    month,
    income,
    expense,
    transfers,
    startBalances,
    endBalances,
    netCashFlow
  }
}

export function buildCashFlowRows(
  accounts: Account[],
  monthlyData: MonthlyCashFlow[],
  transactions: Transaction[]
): CashFlowRow[] {
  const rows: CashFlowRow[] = []

  // Get unique categories from all months
  const incomeCategories = new Set<string>()
  const expenseCategories = new Set<string>()
  const transferCategories = new Set<string>()

  monthlyData.forEach(data => {
    data.income.forEach((_, category) => incomeCategories.add(category))
    data.expense.forEach((_, category) => expenseCategories.add(category))
    data.transfers.forEach((_, category) => transferCategories.add(category))
  })

  // Собираем категории трансферов
  transactions
    .filter(t => t.type === 'transfer')
    .forEach(t => {
      const category = t.category || 'Переводы между счетами'
      transferCategories.add(category)
    })

  // Income section
  rows.push({
    id: 'income',
    type: 'income',
    label: 'Поступления',
    level: 0,
    isExpanded: true
  })

  Array.from(incomeCategories).forEach((category) => {
    rows.push({
      id: `income-${category}`,
      type: 'income',
      label: category,
      level: 1,
      parentId: 'income'
    })
  })

  // Expense section
  rows.push({
    id: 'expense',
    type: 'expense',
    label: 'Расходы',
    level: 0,
    isExpanded: true
  })

  Array.from(expenseCategories).forEach((category) => {
    rows.push({
      id: `expense-${category}`,
      type: 'expense',
      label: category,
      level: 1,
      parentId: 'expense'
    })
  })

  // Start balance section
  rows.push({
    id: 'startBalance',
    type: 'startBalance',
    label: 'Деньги в начале периода',
    level: 0,
    isExpanded: true
  })

  accounts.forEach(account => {
    rows.push({
      id: `startBalance-${account.id}`,
      type: 'startBalance',
      label: account.name,
      level: 1,
      parentId: 'startBalance'
    })
  })

  // End balance section
  rows.push({
    id: 'endBalance',
    type: 'endBalance',
    label: 'Деньги в конце периода',
    level: 0,
    isExpanded: true
  })

  accounts.forEach(account => {
    rows.push({
      id: `endBalance-${account.id}`,
      type: 'endBalance',
      label: account.name,
      level: 1,
      parentId: 'endBalance'
    })
  })

  // Transfers section (для информации, не влияет на чистый поток)
  if (transferCategories.size > 0) {
    rows.push({
      id: 'transfers',
      type: 'transfer',
      label: 'Переводы между счетами',
      level: 0,
      isExpanded: false // свернуто по умолчанию
    })

    Array.from(transferCategories).forEach((category) => {
      rows.push({
        id: `transfer-${category}`,
        type: 'transfer',
        label: category,
        level: 1,
        parentId: 'transfers'
      })
    })
  }

  // Net cash flow
  rows.push({
    id: 'netCashFlow',
    type: 'netCashFlow',
    label: 'Чистый денежный поток',
    level: 0
  })

  return rows
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function getRowValue(
  row: CashFlowRow,
  monthIndex: number,
  monthlyData: MonthlyCashFlow[],
  accounts: Account[]
): number {
  const monthData = monthlyData[monthIndex]
  if (!monthData) return 0

  switch (row.type) {
    case 'income': {
      if (row.level === 0) {
        // Total income
        return Array.from(monthData.income.values()).reduce((sum, val) => sum + val, 0)
      } else {
        // Category income
        const category = row.label
        return monthData.income.get(category) || 0
      }
    }

    case 'expense': {
      if (row.level === 0) {
        // Total expense
        return Array.from(monthData.expense.values()).reduce((sum, val) => sum + val, 0)
      } else {
        // Category expense
        const category = row.label
        return monthData.expense.get(category) || 0
      }
    }

    case 'startBalance': {
      if (row.level === 0) {
        // Total start balance
        return monthData.startBalances.reduce((sum, b) => sum + b.balance, 0)
      } else {
        // Account start balance
        const account = accounts.find(a => a.name === row.label)
        return monthData.startBalances.find(b => b.accountId === account?.id)?.balance || 0
      }
    }

    case 'endBalance': {
      if (row.level === 0) {
        // Total end balance
        return monthData.endBalances.reduce((sum, b) => sum + b.balance, 0)
      } else {
        // Account end balance
        const account = accounts.find(a => a.name === row.label)
        return monthData.endBalances.find(b => b.accountId === account?.id)?.balance || 0
      }
    }

    case 'netCashFlow': {
      return monthData.netCashFlow
    }

    case 'transfer': {
      if (row.level === 0) {
        // Total transfers
        return Array.from(monthData.transfers.values()).reduce((sum, val) => sum + val, 0)
      } else {
        // Category transfers
        const category = row.label
        return monthData.transfers.get(category) || 0
      }
    }

    default:
      return 0
  }
}

export function getTotalValue(
  row: CashFlowRow,
  monthlyData: MonthlyCashFlow[],
  accounts: Account[]
): number {
  if (monthlyData.length === 0) return 0

  switch (row.type) {
    case 'startBalance': {
      // Для начального баланса берем только первый месяц
      return getRowValue(row, 0, monthlyData, accounts)
    }

    case 'endBalance': {
      // Для конечного баланса берем только последний месяц
      return getRowValue(row, monthlyData.length - 1, monthlyData, accounts)
    }

    case 'netCashFlow': {
      // Чистый поток - это сумма по всем месяцам
      let total = 0
      for (let i = 0; i < monthlyData.length; i++) {
        total += getRowValue(row, i, monthlyData, accounts)
      }
      return total
    }

    case 'transfer': {
      // Трансферы суммируем
      let total = 0
      for (let i = 0; i < monthlyData.length; i++) {
        total += getRowValue(row, i, monthlyData, accounts)
      }
      return total
    }

    default: {
      // Для поступлений и расходов суммируем все месяцы
      let total = 0
      for (let i = 0; i < monthlyData.length; i++) {
        total += getRowValue(row, i, monthlyData, accounts)
      }
      return total
    }
  }
}
