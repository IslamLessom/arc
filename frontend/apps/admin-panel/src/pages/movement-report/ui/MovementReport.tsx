import { useMovementReport } from '../hooks/useMovementReport'
import { Table } from '@restaurant-pos/ui'
import type { MovementReportItem } from '../model/types'
import * as Styled from './styled'
import { getMovementReportColumns } from '../lib/constants'

export const MovementReport = () => {
  const {
    reportItems,
    isLoading,
    error,
    searchQuery,
    filters,
    warehouses,
    categories,
    dateRange,
    totalFinalSum,
    handleSearchChange,
    handleFilterChange,
    handleSort,
    handleBack,
    handleExport,
    handlePrint,
    handleColumns,
    handleDateRangeChange,
  } = useMovementReport()

  const columns = getMovementReportColumns()

  const getRowClassName = (record: MovementReportItem) => {
    if (record.expenses > 0) {
      return 'row-with-expenses'
    }
    if (record.receipts > 0) {
      return 'row-with-receipts'
    }
    return ''
  }

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка отчёта по движению...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке отчёта: {error.message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Отчёт по движению {reportItems.length}</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderActions>
          <Styled.ActionButton onClick={handleColumns}>
            <span>📋</span>
            Столбцы
          </Styled.ActionButton>
          <Styled.ActionButton onClick={handleExport}>
            <span>📤</span>
            Экспорт
          </Styled.ActionButton>
          <Styled.ActionButton onClick={handlePrint}>
            <span>🖨️</span>
            Печать
          </Styled.ActionButton>
          <Styled.DateRangeSelector>
            <Styled.DateInput
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange(e.target.value, dateRange.end)}
            />
            <span>—</span>
            <Styled.DateInput
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange(dateRange.start, e.target.value)}
            />
          </Styled.DateRangeSelector>
        </Styled.HeaderActions>
      </Styled.Header>

      <Styled.SearchContainer>
        <Styled.SearchInputWrapper>
          <Styled.SearchBadge>{reportItems.length}</Styled.SearchBadge>
          <Styled.SearchIcon>🔍</Styled.SearchIcon>
          <Styled.SearchInput
            placeholder="Быстрый поиск"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </Styled.SearchInputWrapper>
        <Styled.FilterSelect
          value={filters.warehouse_id || ''}
          onChange={(e) =>
            handleFilterChange({ warehouse_id: e.target.value || undefined })
          }
        >
          <option value="">Склад</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </Styled.FilterSelect>
        <Styled.FilterSelect
          value={filters.type || ''}
          onChange={(e) =>
            handleFilterChange({ type: (e.target.value as 'ingredient' | 'product') || undefined })
          }
        >
          <option value="">Тип</option>
          <option value="ingredient">Ингредиент</option>
          <option value="product">Товар</option>
        </Styled.FilterSelect>
        <Styled.FilterSelect
          value={filters.category_id || ''}
          onChange={(e) =>
            handleFilterChange({ category_id: e.target.value || undefined })
          }
        >
          <option value="">Категория</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Styled.FilterSelect>
        <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
      </Styled.SearchContainer>

      <Styled.TableContainer>
        <Styled.StyledTable
          columns={columns}
          dataSource={reportItems}
          rowKey="id"
          pagination={false}
          rowClassName={getRowClassName}
        />
        <Styled.TotalRow>
          Итого: {totalFinalSum.toFixed(2)} ₽
        </Styled.TotalRow>
      </Styled.TableContainer>
    </Styled.PageContainer>
  )
}

