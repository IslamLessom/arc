export enum PreparationMethod {
  Raw = 'raw',
  Cleaning = 'cleaning',
  Boiling = 'boiling',
  Frying = 'frying',
  Stewing = 'stewing',
  Baking = 'baking',
}

export const PreparationMethodLabels: Record<PreparationMethod, string> = {
  [PreparationMethod.Raw]: 'Сырой',
  [PreparationMethod.Cleaning]: 'Очистка',
  [PreparationMethod.Boiling]: 'Варка',
  [PreparationMethod.Frying]: 'Жарка',
  [PreparationMethod.Stewing]: 'Тушение',
  [PreparationMethod.Baking]: 'Запекание',
}

