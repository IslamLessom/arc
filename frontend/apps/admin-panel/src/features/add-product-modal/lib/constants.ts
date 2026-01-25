export const MODAL_TITLES = {
  ADD: 'Добавление товара',
  EDIT: 'Редактирование товара',
} as const

export const MODIFICATION_TYPES = {
  WITHOUT: 'Без модификаций (один вид товара)',
  WITH: 'С модификациями (несколько видов товара)',
} as const

export const ARIA_LABELS = {
  CLOSE_MODAL: 'Закрыть модальное окно',
} as const

export const FORM_LABELS = {
  NAME: 'Название',
  CATEGORY: 'Категория',
  WAREHOUSE: 'Склад',
  WORKSHOP: 'Цех приготовления',
  COVER: 'Обложка',
  OPTIONS: 'Опции',
  WEIGHTED_PRODUCT: 'Весовой товар',
  EXCLUDE_FROM_DISCOUNTS: 'Не участвует в скидках',
  PRICE_AND_BARCODE: 'Цена и штрихкод',
  BARCODE: 'Штрихкод',
  COST_PRICE: 'Себестоимость без НДС',
  MARKUP: 'Наценка',
  TOTAL: 'Итого',
} as const

export const PLACEHOLDERS = {
  NAME: 'Введите название',
  SELECT_CATEGORY: 'Выберите категорию',
  SELECT_WAREHOUSE: 'Выберите склад',
  NO_WORKSHOP: 'Без цеха',
  BARCODE: 'Введите штрихкод',
  UPLOAD_IMAGE: 'Нажмите для загрузки изображения',
} as const

export const HELP_LINKS = {
  WHAT_IS_WEIGHTED: 'Что такое весовой товар?',
  WHEN_EXCLUDE_FROM_DISCOUNTS: 'Когда товар не участвует в скидках?',
  HOW_TO_CHANGE_COST: 'Как изменить себестоимость?',
  HOW_TO_ADD_BARCODE: 'Как добавить штрихкод товара?',
  WHAT_ARE_MODIFICATIONS: 'Что такое модификации?',
} as const

export const BUTTON_TEXT = {
  SAVE: 'Сохранить',
  SAVING: 'Сохранение...',
  SAVE_AND_CREATE: 'Сохранить и создать ещё',
} as const

export const ALERT_TEXT = {
  ERROR: 'Ошибка',
} as const
