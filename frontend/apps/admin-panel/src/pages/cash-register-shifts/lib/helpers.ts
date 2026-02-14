import type { Shift } from '@restaurant-pos/types'
import type { CashRegisterShiftTable } from '../model/types'

/**
 * Преобразует данные смены из API в формат для таблицы
 * Вычисляет базовые поля для таблицы
 */
export function transformShiftToTable(shift: Shift): CashRegisterShiftTable {
  // Для открытых смен: в кассе = openingBalance (транзакции не подгружены)
  // Для закрытых смен: в кассе = leaveCash (если есть), иначе finalCash
  const isOpen = shift.status === 'open'

  // Если смена закрыта и есть leaveCash - используем его
  // Иначе используем openingBalance
  const inCash = !isOpen && (shift.leaveCash !== undefined || shift.closingBalance !== undefined)
    ? (shift.leaveCash ?? shift.closingBalance ?? shift.openingBalance)
    : shift.openingBalance

  return {
    ...shift,
    number: 0,
    isOpen,
    inCash,
    difference: 0,
  }
}

/**
 * Форматирует дату в формат DD.MM.YYYY HH:mm
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Форматирует сумму в формат 1 234.56 руб
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Форматирует дату в формат DD.MM.YYYY
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Возвращает текстовое представление статуса смены
 */
export function getStatusText(status: 'open' | 'closed'): string {
  return status === 'open' ? 'Смена открыта' : 'Смена закрыта'
}

/**
 * Возвращает цвет для статуса смены
 */
export function getStatusColor(status: 'open' | 'closed'): string {
  return status === 'open' ? '#52c41a' : '#faad14'
}

/**
 * Вычисляет сумму инкассации (сумма всех withdrawals из кассы)
 */
export function calculateEncashment(shift: Shift): number {
  if (shift.closingBalance !== undefined) {
    const leaveCash = shift.leaveCash ?? shift.closingBalance
    return Math.max(0, shift.closingBalance - leaveCash)
  }

  return shift.transactions?.reduce((acc, transaction) => {
    // Инкассация - это расходы с категорией "инкассация"
    if (transaction.type === 'expense' && transaction.category?.toLowerCase() === 'инкассация') {
      return acc + transaction.amount
    }
    return acc
  }, 0) ?? 0
}

/**
 * Формирует строку с информацией о разнице
 */
export function formatDifference(difference: number, status: 'open' | 'closed'): string {
  void status
  if (difference === 0) {
    return '0 руб'
  }
  const sign = difference > 0 ? '+' : ''
  return `${sign}${formatCurrency(difference)}`
}
