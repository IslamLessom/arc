import { useProducts } from '../hooks/useProducts'
import { Table } from '@restaurant-pos/ui'
import { AddProductModal } from '../../../features/add-product-modal'
import { getProductsTableColumns } from '../lib/constants'
import * as Styled from './styled'

export const Products = () => {
  const {
    products,
    isLoading,
    error,
    searchQuery,
    filters,
    categories,
    workshops,
    handleSearchChange,
    handleFilterChange,
    handleSort,
    handleBack,
    handleEdit,
    handleAdd,
    handleExport,
    handlePrint,
    handleColumns,
    handleCart,
    isModalOpen,
    editingProductId,
    handleCloseModal,
    handleSuccess,
  } = useProducts()

  const columns = getProductsTableColumns({
    onEdit: handleEdit,
  })

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка товаров...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке товаров: {error.message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Товары {products.length}</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderActions>
          <Styled.ActionButton onClick={handleCart}>
            <span>🛒</span>
            Корзина
          </Styled.ActionButton>
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
          <Styled.ActionButton>
            <span>⋯</span>
          </Styled.ActionButton>
          <Styled.AddButton onClick={handleAdd}>Добавить</Styled.AddButton>
        </Styled.HeaderActions>
      </Styled.Header>

      <Styled.SearchContainer>
        <Styled.SearchInputWrapper>
          <Styled.SearchInput
            placeholder="Быстрый поиск"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </Styled.SearchInputWrapper>
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
        <Styled.FilterSelect
          value={filters.workshop_id || ''}
          onChange={(e) =>
            handleFilterChange({ workshop_id: e.target.value || undefined })
          }
        >
          <option value="">Цех</option>
          {workshops.map((workshop) => (
            <option key={workshop.id} value={workshop.id}>
              {workshop.name}
            </option>
          ))}
        </Styled.FilterSelect>
        <Styled.ActiveFilter>
          Заведение: Ebari
        </Styled.ActiveFilter>
        <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
      </Styled.SearchContainer>

      <Styled.TableContainer>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleEdit(record.id),
          })}
          pagination={false}
        />
      </Styled.TableContainer>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        productId={editingProductId}
      />
    </Styled.PageContainer>
  )
}

