export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer'
}

export const TransactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.INCOME]: 'Доход',
  [TransactionType.EXPENSE]: 'Расход',
  [TransactionType.TRANSFER]: 'Перевод',
}
