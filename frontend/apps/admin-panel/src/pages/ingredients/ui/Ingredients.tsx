import { useIngredients } from '../hooks/useIngredients'
import { Input, Button, ButtonVariant, ButtonSize } from '@restaurant-pos/ui'
import { Table } from 'antd'
import { AddIngredientModal } from '../../../features/add-ingredient-modal'
import { EditIngredientModal } from '../../../features/edit-ingredient-modal'
import { INGREDIENTS_TABLE_COLUMNS } from '../lib/constants'
import * as Styled from './styled'

export const Ingredients = () => {
  const {
    ingredients,
    isLoading,
    error,
    searchQuery,
    sort,
    totalIngredientCount,
    totalStock,
    totalValue,
    isAddModalOpen,
    isEditModalOpen,
    editingIngredientId,
    handleSearchChange,
    handleSort,
    handleBack,
    handleEdit,
    handleDelete,
    handleAdd,
    handleCloseAddModal,
    handleCloseEditModal,
    handleAddSuccess,
    handleEditSuccess,
    handleExport,
    handlePrint,
    handleColumns
  } = useIngredients()

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка ингредиентов...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке ингредиентов: {error.message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  const isLowStock = (stock: number) => stock < 10

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack} aria-label="Назад">←</Styled.BackButton>
          <Styled.Title>Ингредиенты <span style={{ color: '#6366f1', marginLeft: '4px' }}>{ingredients.length}</span></Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderActions>
          <Styled.ActionButton onClick={handleColumns} aria-label="Настроить столбцы">
            <span>📋</span>
            <span className="action-text">Столбцы</span>
          </Styled.ActionButton>
          <Styled.ActionButton onClick={handleExport} aria-label="Экспорт">
            <span>📤</span>
            <span className="action-text">Экспорт</span>
          </Styled.ActionButton>
          <Styled.ActionButton onClick={handlePrint} aria-label="Печать">
            <span>🖨️</span>
            <span className="action-text">Печать</span>
          </Styled.ActionButton>
          <Styled.AddButton onClick={handleAdd}>+ Добавить</Styled.AddButton>
        </Styled.HeaderActions>
      </Styled.Header>

      <Styled.SearchContainer>
        <Styled.SearchInputWrapper>
          <Styled.SearchIcon>🔍</Styled.SearchIcon>
           <Input
             placeholder="Поиск ингредиентов..."
             value={searchQuery}
             onChange={(e) => handleSearchChange(e.target.value)}
             style={{ width: '100%', paddingLeft: '36px' }}
           />
        </Styled.SearchInputWrapper>
        <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
      </Styled.SearchContainer>

      {/* Desktop/Tablet Table View */}
      <Styled.TableContainer>
         <Table
           columns={INGREDIENTS_TABLE_COLUMNS.map(column => ({
             ...column,
             onCell: column.key === 'actions' ? (record) => ({
               onClick: (e) => e.stopPropagation(),
             }) : undefined,
              render: column.key === 'actions' ? (_, record) => (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Button
                    variant={ButtonVariant.Link}
                    size={ButtonSize.Small}
                    onClick={() => handleEdit(record.id)}
                    style={{ fontSize: '13px' }}
                  >
                    ✏️
                  </Button>
                  <Button
                    variant={ButtonVariant.Ghost}
                    size={ButtonSize.Small}
                    onClick={() => handleDelete(record.id)}
                    style={{ fontSize: '16px' }}
                  >
                    🗑️
                  </Button>
                </div>
              ) : column.render,
           }))}
           dataSource={ingredients}
           rowKey="id"
           pagination={false}
           locale={{ emptyText: 'Нет ингредиентов' }}
           summary={() => (
             <Table.Summary.Row>
               <Table.Summary.Cell index={0}><strong>Итого</strong></Table.Summary.Cell>
               <Table.Summary.Cell index={1}>-</Table.Summary.Cell>
               <Table.Summary.Cell index={2}>-</Table.Summary.Cell>
               <Table.Summary.Cell index={3}><strong>{totalIngredientCount}</strong></Table.Summary.Cell>
               <Table.Summary.Cell index={4}><strong>{totalStock.toFixed(2)}</strong></Table.Summary.Cell>
               <Table.Summary.Cell index={5}>-</Table.Summary.Cell>
               <Table.Summary.Cell index={6}>-</Table.Summary.Cell>
               <Table.Summary.Cell index={7}><strong style={{ color: '#6366f1' }}>{totalValue.toFixed(2)} ₽</strong></Table.Summary.Cell>
               <Table.Summary.Cell index={8}></Table.Summary.Cell>
             </Table.Summary.Row>
           )}
         />
       </Styled.TableContainer>

      {/* Mobile Card View */}
      <Styled.MobileCardsContainer>
        {ingredients.length === 0 ? (
          <Styled.EmptyState>
            <Styled.EmptyStateIcon>📦</Styled.EmptyStateIcon>
            <Styled.EmptyStateText>Ингредиенты не найдены</Styled.EmptyStateText>
            <Styled.EmptyStateSubtext>Попробуйте изменить параметры поиска или добавьте новый ингредиент</Styled.EmptyStateSubtext>
          </Styled.EmptyState>
        ) : (
          ingredients.map((ingredient, index) => (
            <Styled.IngredientCard key={ingredient.id} style={{ animationDelay: `${index * 0.05}s` }}>
              <Styled.CardHeader>
                <Styled.CardTitle>{ingredient.name}</Styled.CardTitle>
                <Styled.CardActions>
                  <Styled.CardAction onClick={() => handleEdit(ingredient.id)} aria-label="Редактировать">
                    ✏️
                  </Styled.CardAction>
                  <Styled.CardAction onClick={() => handleDelete(ingredient.id)} aria-label="Удалить">
                    🗑️
                  </Styled.CardAction>
                </Styled.CardActions>
              </Styled.CardHeader>
              <Styled.CardContent>
                <Styled.CardRow>
                  <Styled.CardLabel>Категория</Styled.CardLabel>
                  <Styled.CardCategory>{ingredient.category}</Styled.CardCategory>
                </Styled.CardRow>
                <Styled.CardRow>
                  <Styled.CardLabel>Остатки</Styled.CardLabel>
                  <Styled.CardStock $low={isLowStock(ingredient.stock)}>
                    {ingredient.stock.toFixed(2)} {ingredient.measureUnit}
                  </Styled.CardStock>
                </Styled.CardRow>
                <Styled.CardRow>
                  <Styled.CardLabel>Стоимость</Styled.CardLabel>
                  <Styled.CardCost>{ingredient.cost.toFixed(2)} ₽</Styled.CardCost>
                </Styled.CardRow>
                {ingredient.supplier && (
                  <Styled.CardRow>
                    <Styled.CardLabel>Поставщик</Styled.CardLabel>
                    <Styled.CardValue>{ingredient.supplier}</Styled.CardValue>
                  </Styled.CardRow>
                )}
                {ingredient.lastDelivery && (
                  <Styled.CardRow>
                    <Styled.CardLabel>Последняя поставка</Styled.CardLabel>
                    <Styled.CardValue>{ingredient.lastDelivery}</Styled.CardValue>
                  </Styled.CardRow>
                )}
              </Styled.CardContent>
            </Styled.IngredientCard>
          ))
        )}
      </Styled.MobileCardsContainer>

      {/* Mobile Summary Card */}
      <Styled.SummaryCard>
        <Styled.SummaryTitle>Сводка</Styled.SummaryTitle>
        <Styled.SummaryStats>
          <Styled.SummaryItem>
            <Styled.SummaryItemLabel>Всего ингредиентов</Styled.SummaryItemLabel>
            <Styled.SummaryItemValue>{totalIngredientCount}</Styled.SummaryItemValue>
          </Styled.SummaryItem>
          <Styled.SummaryItem>
            <Styled.SummaryItemLabel>Общий остаток</Styled.SummaryItemLabel>
            <Styled.SummaryItemValue>{totalStock.toFixed(2)}</Styled.SummaryItemValue>
          </Styled.SummaryItem>
          <Styled.SummaryItem>
            <Styled.SummaryItemLabel>Общая стоимость</Styled.SummaryItemLabel>
            <Styled.SummaryItemValue $accent>{totalValue.toFixed(2)} ₽</Styled.SummaryItemValue>
          </Styled.SummaryItem>
        </Styled.SummaryStats>
      </Styled.SummaryCard>

      <AddIngredientModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleAddSuccess}
      />

      {editingIngredientId && (
        <EditIngredientModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
          ingredientId={editingIngredientId}
        />
      )}
    </Styled.PageContainer>
  )
}