// Transaction category translations to Russian
export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'supply_payment': 'Оплата поставки',
  'sales': 'Продажи',
  'cash_payment': 'Оплата наличными',
  'card_payment': 'Оплата картой',
  'order_cancellation': 'Отмена заказа',
  'rent': 'Аренда',
  'discount': 'Скидка',
  'other': 'Прочее',
  'CashPayment': 'Оплата наличными',
  'CardPayment': 'Оплата картой',
  'Order Cancellation': 'Отмена заказа',
  'Sales': 'Продажи',
  'Rent': 'Аренда',
  'Discount': 'Скидка',
  'Other': 'Прочее',
  'Без категории': 'Без категории',
  'Переводы между счетами': 'Переводы между счетами'
}

export function translateCategory(category: string | undefined): string {
  if (!category) return '-'
  return CATEGORY_TRANSLATIONS[category] || category
}
