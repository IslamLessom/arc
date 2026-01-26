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
    return (item.quantity * item.price_per_unit).toFixed(2)
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
                <Styled.TableCell>{item.quantity}</Styled.TableCell>
                <Styled.TableCell>{translateUnit(item.unit)}</Styled.TableCell>
                <Styled.TableCell>
                  {item.price_per_unit.toFixed(2)} ₽
                </Styled.TableCell>
                <Styled.TableCell>{calculateTotal(item)} ₽</Styled.TableCell>
                <Styled.TableCell>
                  <Styled.LimitInput
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={item.limit}
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
          </Styled.TableBody>
        </Styled.Table>
      )}
    </Styled.BalancesContainer>
  )
}

