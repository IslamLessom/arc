const ROLE_NAME_MAP: Record<string, string> = {
  'owner': 'Владелец',
  'employee': 'Сотрудник',
  'cashier': 'Кассир',
  'manager': 'Менеджер',
  'waiter': 'Официант',
  'cook': 'Повар',
}

export const getRoleName = (roleName: string): string => {
  return ROLE_NAME_MAP[roleName] || roleName
}
