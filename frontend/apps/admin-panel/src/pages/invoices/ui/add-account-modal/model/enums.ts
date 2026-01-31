export enum AccountType {
  CASHLESS = 'cashless',
  BANK_CARD = 'bank_card',
  CASH = 'cash',
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.CASHLESS]: 'Безналичные',
  [AccountType.BANK_CARD]: 'Банковская карта',
  [AccountType.CASH]: 'Наличные',
}
