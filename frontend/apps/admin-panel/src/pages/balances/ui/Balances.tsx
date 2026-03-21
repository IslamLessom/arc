import { useBalances } from '../hooks/useBalances'
import * as Styled from './styled'
import type { Stock } from '@restaurant-pos/api-client'
import { translateUnit } from '../../technical-cards/lib/unitTranslator'

export const Balances = () => {
  const {
    stock,
    isLoading,
    error,
    filters,
    handleFilterChange,
    handleUpdateLimit,
    isUpdatingLimit,
  } = useBalances()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange({ search: e.target.value || undefined })
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange({
      type: (e.target.value as 'ingredient' | 'product' | '') || undefined,
    })
  }

  const handleLimitChange = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newLimit = parseFloat(e.target.value)
    if (!isNaN(newLimit) && newLimit >= 0) {
      await handleUpdateLimit(id, newLimit)
    }
  }

  const getItemName = (item: Stock) => {
    return item.ingredient?.name || item.product?.name || '-'
  }

  const getCategoryName = (item: Stock) => {
    return (
      item.ingredient?.category?.name ||
      item.product?.category?.name ||
      '-'
    )
  }

  const getItemType = (item: Stock) => {
    return item.ingredient_id ? 'Ингредиент' : 'Товар'
  }

  const calculateTotal = (item: Stock) => {
    // Сумма может быть отрицательной если остаток отрицательный
    const total = item.quantity * item.price_per_unit
    return total.toFixed(2)
  }

  const calculateGrandTotal = () => {
    if (!stock || stock.length === 0) return '0.00'
    // Считаем общую сумму включая отрицательные остатки
    const total = stock.reduce((sum, item) => {
      return sum + (item.quantity * item.price_per_unit)
    }, 0)
    return total.toFixed(2)
  }

  const isLowStock = (item: Stock) => {
    return item.quantity <= item.limit
  }

  if (isLoading) {
    return (
      <Styled.BalancesContainer>
        <Styled.LoadingContainer>Загрузка остатков...</Styled.LoadingContainer>
      </Styled.BalancesContainer>
    )
  }

  if (error) {
    return (
      <Styled.BalancesContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке остатков: {error.message}
        </Styled.ErrorContainer>
      </Styled.BalancesContainer>
    )
  }

  return (
    <Styled.BalancesContainer>
      <Styled.Header>
        <Styled.Title>Остатки на складе</Styled.Title>
      </Styled.Header>

      <Styled.FiltersContainer>
        <Styled.FilterInput
          type="text"
          placeholder="Поиск по названию..."
          value={filters.search || ''}
          onChange={handleSearchChange}
        />
        <Styled.FilterSelect
          value={filters.type || ''}
          onChange={handleTypeChange}
        >
          <option value="">Все типы</option>
          <option value="ingredient">Ингредиенты</option>
          <option value="product">Товары</option>
        </Styled.FilterSelect>
      </Styled.FiltersContainer>

      {!stock || stock.length === 0 ? (
        <Styled.EmptyContainer>
          <p>Остатки не найдены</p>
        </Styled.EmptyContainer>
      ) : (
        <Styled.Table>
          <Styled.TableHead>
            <tr>
              <Styled.TableHeader>Наименование</Styled.TableHeader>
              <Styled.TableHeader>Тип</Styled.TableHeader>
              <Styled.TableHeader>Категория</Styled.TableHeader>
              <Styled.TableHeader>Склад</Styled.TableHeader>
              <Styled.TableHeader>Количество</Styled.TableHeader>
              <Styled.TableHeader>Ед. изм.</Styled.TableHeader>
              <Styled.TableHeader>Цена за ед.</Styled.TableHeader>
              <Styled.TableHeader>Сумма</Styled.TableHeader>
              <Styled.TableHeader>Лимит</Styled.TableHeader>
              <Styled.TableHeader>Статус</Styled.TableHeader>
            </tr>
          </Styled.TableHead>
          <Styled.TableBody>
            {stock.map((item) => (
              <Styled.TableRow key={item.id}>
                <Styled.TableCell>{getItemName(item)}</Styled.TableCell>
                <Styled.TableCell>{getItemType(item)}</Styled.TableCell>
                <Styled.TableCell>{getCategoryName(item)}</Styled.TableCell>
                <Styled.TableCell>{item.warehouse.name}</Styled.TableCell>
                <Styled.TableCell 
                  style={{ color: item.quantity < 0 ? '#ff4d4f' : 'inherit' }}
                >
                  {item.quantity.toFixed(2)}
                </Styled.TableCell>
                <Styled.TableCell>{translateUnit(item.unit)}</Styled.TableCell>
                <Styled.TableCell>
                  {item.price_per_unit.toFixed(2)} ₽
                </Styled.TableCell>
                <Styled.TableCell 
                  style={{ 
                    color: parseFloat(calculateTotal(item)) < 0 ? '#ff4d4f' : 'inherit',
                    fontWeight: parseFloat(calculateTotal(item)) < 0 ? 'bold' : 'normal'
                  }}
                >
                  {calculateTotal(item)} ₽
                </Styled.TableCell>
                <Styled.TableCell>
                  <Styled.LimitInput
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={item.limit.toFixed(2)}
                    onBlur={(e) => handleLimitChange(item.id, e)}
                    disabled={isUpdatingLimit}
                  />
                </Styled.TableCell>
                <Styled.TableCell>
                  {isLowStock(item) ? (
                    <Styled.Badge $variant="warning">Низкий остаток</Styled.Badge>
                  ) : (
                    <Styled.Badge $variant="success">В норме</Styled.Badge>
                  )}
                </Styled.TableCell>
              </Styled.TableRow>
            ))}
            <Styled.TableRow style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
              <Styled.TableCell colSpan={7} style={{ textAlign: 'right' }}>
                Итого:
              </Styled.TableCell>
              <Styled.TableCell 
                style={{ 
                  color: parseFloat(calculateGrandTotal()) < 0 ? '#ff4d4f' : 'inherit',
                  fontWeight: 'bold',
                  fontSize: '1.1em'
                }}
              >
                {calculateGrandTotal()} ₽
              </Styled.TableCell>
              <Styled.TableCell colSpan={2}></Styled.TableCell>
            </Styled.TableRow>
          </Styled.TableBody>
        </Styled.Table>
      )}
    </Styled.BalancesContainer>
  )
}

