import { TransactionType } from '../model/enums'

const DEFAULT_CATEGORIES = {
  [TransactionType.INCOME]: [
    'Продажи',
    'Возврат от поставщика',
    'Прочие поступления',
  ],
  [TransactionType.EXPENSE]: [
    'Закупка товаров',
    'Оплата услуг',
    'Зарплата',
    'Аренда',
    'Коммунальные услуги',
    'Маркетинг',
    'Прочие расходы',
  ],
}

export function getTransactionCategories(type?: TransactionType): string[] {
  if (!type) {
    return [...DEFAULT_CATEGORIES[TransactionType.INCOME], ...DEFAULT_CATEGORIES[TransactionType.EXPENSE]]
  }
  return DEFAULT_CATEGORIES[type] || []
}

export function getCategoriesForType(type: TransactionType): string[] {
  return DEFAULT_CATEGORIES[type] || []
}
