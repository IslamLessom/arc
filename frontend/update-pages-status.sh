#!/bin/bash

# Скрипт для массового обновления страниц с функциональностью печати, экспорта и управления столбцами

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Обновление страниц admin-panel...${NC}"

# Список страниц для обновления (уже готовые: employees, suppliers, supplies)
# Нужно обновить:
PAGES=(
  "warehouses"
  "products"
  "ingredients"
  "technical-cards"
  "workshops"
  "movements"
  "write-offs"
  "positions"
  "marketing-customers"
  "marketing-customer-groups"
  "marketing-promotions"
  "marketing-exclusions"
  "marketing-loyalty-programs"
)

echo -e "${GREEN}Следующие страницы нужно обновить вручную:${NC}"
for page in "${PAGES[@]}"; do
  echo "  - $page"
done

echo ""
echo -e "${YELLOW}Для каждой страницы нужно:${NC}"
echo "1. В hooks/useXXX.ts:"
echo "   - Добавить импорты из @restaurant-pos/ui"
echo "   - Добавить useState для isColumnModalOpen"
echo "   - Добавить useMemo для allColumns"
echo "   - Использовать useColumnVisibility"
echo "   - Заменить console.log на реальные функции"
echo "   - Вернуть новые свойства в return"
echo ""
echo "2. В ui/XXX.tsx:"
echo "   - Импортировать ColumnManager"
echo "   - Получить новые свойства из хука"
echo "   - Использовать visibleColumns для таблицы"
echo "   - Добавить модальное окно ColumnManager"
echo ""
echo -e "${GREEN}Примеры готовых страниц:${NC}"
echo "  - frontend/apps/admin-panel/src/pages/employees/"
echo "  - frontend/apps/admin-panel/src/pages/suppliers/"
echo "  - frontend/apps/admin-panel/src/pages/supplies/"
echo ""
echo -e "${YELLOW}См. подробное руководство: frontend/PRINT_EXPORT_COLUMNS_GUIDE.md${NC}"
