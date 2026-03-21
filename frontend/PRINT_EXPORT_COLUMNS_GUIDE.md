# Руководство по внедрению функций печати, экспорта и управления столбцами

## Обзор

Функции **Печати**, **Экспорта** и **Управления столбцами** теперь полностью реализованы и доступны через пакет `@restaurant-pos/ui`.

## Что было сделано

### 1. Созданы утилиты в пакете UI (`frontend/packages/ui/src/table-utils/`)

- **export.ts** - функции `exportToCSV()` и `exportToExcel()` для экспорта данных
- **print.ts** - функция `printTable()` для печати таблиц
- **useColumnVisibility.ts** - хук для управления видимостью столбцов
- **ColumnManager.tsx** - компонент для UI управления столбцами

### 2. Обновлены страницы super-admin

✅ **Plans.tsx** - добавлены все три функции
✅ **Subscriptions.tsx** - добавлены все три функции

### 3. Обновлена страница admin-panel

✅ **Employees** - полностью реализован паттерн (см. ниже)

## Как применить на других страницах admin-panel

### Шаг 1: Обновить хук (файл `hooks/useXXX.ts`)

```typescript
// 1. Добавить импорты
import { 
  exportToCSV, 
  exportToExcel, 
  printTable, 
  useColumnVisibility 
} from '@restaurant-pos/ui'
import { getXXXTableColumns } from '../lib/constants'

export const useXXX = () => {
  // 2. Добавить состояние для модального окна столбцов
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false)

  // ... существующий код ...

  // 3. Получить все столбцы
  const allColumns = useMemo(() => getXXXTableColumns({ onEdit: () => {} }), [])

  // 4. Использовать хук управления столбцами
  const {
    visibleColumns,
    columnInfo,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetColumnVisibility
  } = useColumnVisibility(allColumns, {
    storageKey: 'admin-panel-XXX-columns' // Уникальный ключ для каждой страницы
  })

  // 5. Реализовать обработчики
  const handleExport = () => {
    exportToExcel(filteredAndSortedData, visibleColumns, 'filename.xlsx')
  }

  const handlePrint = () => {
    printTable(filteredAndSortedData, visibleColumns, 'Заголовок для печати', {
      showDate: true,
      orientation: 'landscape' // или 'portrait'
    })
  }

  const handleColumns = () => {
    setIsColumnModalOpen(true)
  }

  const handleCloseColumnModal = () => {
    setIsColumnModalOpen(false)
  }

  // 6. Вернуть новые свойства
  return {
    // ... существующие свойства ...
    handleExport,
    handlePrint,
    handleColumns,
    // Column management
    isColumnModalOpen,
    handleCloseColumnModal,
    visibleColumns,
    columnInfo,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetColumnVisibility,
  }
}
```

### Шаг 2: Обновить UI компонент (файл `ui/XXX.tsx`)

```typescript
// 1. Добавить импорт
import { Table, ColumnManager } from '@restaurant-pos/ui'

export const XXX = () => {
  const {
    // ... существующие свойства ...
    handleExport,
    handlePrint,
    handleColumns,
    // Column management
    isColumnModalOpen,
    handleCloseColumnModal,
    visibleColumns,
    columnInfo,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetColumnVisibility,
  } = useXXX()

  // 2. Использовать visibleColumns вместо всех столбцов
  const columns = visibleColumns.map(col => ({
    ...col,
    // Если есть столбец с actions, нужно восстановить его render функцию
    ...(col.key === 'actions' ? { render: (_: unknown, record: any) => {
      const OriginalEditButton = getXXXTableColumns({ onEdit: handleEdit })
        .find(c => c.key === 'actions')?.render
      return OriginalEditButton ? OriginalEditButton(_, record) : null
    }} : {})
  }))

  return (
    <Styled.PageContainer>
      {/* ... существующий код с кнопками ... */}
      
      {/* Таблица использует visibleColumns */}
      <Table
        columns={columns}
        dataSource={data}
        // ... другие пропсы ...
      />

      {/* 3. Добавить модальное окно управления столбцами */}
      {isColumnModalOpen && (
        <ColumnManager
          columns={columnInfo}
          onToggle={toggleColumn}
          onShowAll={showAllColumns}
          onHideAll={hideAllColumns}
          onReset={resetColumnVisibility}
          onClose={handleCloseColumnModal}
        />
      )}
    </Styled.PageContainer>
  )
}
```

## Страницы, которые нужно обновить в admin-panel

Все страницы с кнопками "Столбцы", "Экспорт", "Печать" (которые сейчас только console.log):

1. ✅ **Employees** (уже готово)
2. **Suppliers** - `pages/suppliers/`
3. **Supplies** - `pages/supplies/`
4. **Warehouses** - `pages/warehouses/`
5. **Movements** - `pages/movements/`
6. **MovementReport** - `pages/movement-report/`
7. **WriteOffs** - `pages/write-offs/`
8. **Workshops** - `pages/workshops/`
9. **TechnicalCards** - `pages/technical-cards/`
10. **Ingredients** - `pages/ingredients/`
11. **IngredientCategories** - `pages/ingredient-categories/`
12. **Positions** - `pages/positions/`
13. **MarketingCustomers** - `pages/marketing-customers/`
14. **MarketingCustomerGroups** - `pages/marketing-customer-groups/`
15. **MarketingPromotions** - `pages/marketing-promotions/`
16. **MarketingExclusions** - `pages/marketing-exclusions/`

## API Утилит

### exportToCSV / exportToExcel

```typescript
exportToCSV(
  data: any[],           // Данные для экспорта
  columns: any[],        // Определения столбцов
  filename: string       // Имя файла (по умолчанию 'export.csv'/'export.xlsx')
)
```

### printTable

```typescript
printTable(
  data: any[],           // Данные для печати
  columns: any[],        // Определения столбцов
  title?: string,        // Заголовок документа
  options?: {
    showDate?: boolean,        // Показывать дату печати (по умолчанию true)
    orientation?: 'portrait' | 'landscape'  // Ориентация (по умолчанию 'portrait')
  }
)
```

### useColumnVisibility

```typescript
const {
  visibleColumns,           // Отфильтрованный массив видимых столбцов
  columnInfo,              // Информация о столбцах для UI
  toggleColumn,            // (columnKey: string) => void
  showAllColumns,          // () => void
  hideAllColumns,          // () => void
  resetColumnVisibility    // () => void
} = useColumnVisibility(
  columns: any[],          // Все столбцы
  options?: {
    defaultHidden?: string[],  // Столбцы, скрытые по умолчанию
    storageKey?: string        // Ключ для localStorage
  }
)
```

## Важные замечания

1. **Уникальные storageKey**: Каждая страница должна иметь уникальный ключ для сохранения настроек столбцов
2. **Обязательные столбцы**: Добавьте `required: true` к столбцам, которые нельзя скрыть
3. **Ориентация печати**: Используйте `landscape` для широких таблиц, `portrait` для узких
4. **Имена файлов**: Используйте осмысленные имена файлов для экспорта

## Преимущества

- ✅ Единообразная функциональность на всех страницах
- ✅ Сохранение настроек столбцов в localStorage
- ✅ Профессиональная печать с форматированием
- ✅ Экспорт в Excel и CSV
- ✅ Управление видимостью столбцов через удобный UI
- ✅ Переиспользуемый код

## Пример использования (кратко)

```typescript
// Hook
const { visibleColumns, handlePrint, handleExport, handleColumns, ... } = useEmployees()

// UI
<Button onClick={handleColumns}>Столбцы</Button>
<Button onClick={handleExport}>Экспорт</Button>
<Button onClick={handlePrint}>Печать</Button>

<Table columns={visibleColumns} ... />

{isColumnModalOpen && <ColumnManager ... />}
```
