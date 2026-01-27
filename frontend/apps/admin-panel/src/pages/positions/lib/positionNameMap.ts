export const POSITION_NAMES: Record<string, string> = {
  owner: 'Владелец',
  manager: 'Управляющий',
  cashier: 'Кассир',
  cook: 'Повар',
  waiter: 'Официант',
  employee: 'Сотрудник',
  bartender: 'Бармен',
  hostess: 'Хостес',
  chef: 'Шеф-повар',
  sous_chef: 'Су-шеф',
}

export const getPositionName = (name: string): string => {
  return POSITION_NAMES[name] || name
}
