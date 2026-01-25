import { useIngredientCategories } from '../hooks/useIngredientCategories'
import { Input } from '@restaurant-pos/ui'
import { AddIngredientCategoryModal } from '../../../widgets/add-ingredient-category-modal'
import * as Styled from './styled'

export const IngredientCategories = () => {
  const {
    categories,
    isLoading,
    error,
    searchQuery,
    handleSearchChange,
    handleBack,
    handleDelete,
    handleEdit,
    handleAdd,
    handleExport,
    handlePrint,
    handleColumns,
    isModalOpen,
    handleCloseModal,
    handleCategoryCreated,
  } = useIngredientCategories()

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка категорий...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке категорий: {error.message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  const categoriesList = categories || []
  const totalIngredientCount = 0 // TODO: Calculate from ingredients
  const totalStock = null // TODO: Calculate from warehouse
  const totalValue = null // TODO: Calculate from warehouse

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Категории ингредиентов {categoriesList.length}</Styled.Title>
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
          <Styled.AddButton onClick={handleAdd}>Добавить</Styled.AddButton>
        </Styled.HeaderActions>
      </Styled.Header>

      <Styled.SearchContainer>
        <Styled.SearchInputWrapper>
          <Styled.SearchIcon>🔍</Styled.SearchIcon>
          <Input
            placeholder="Быстрый поиск"
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ width: '100%' }}
          />
        </Styled.SearchInputWrapper>
        <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
      </Styled.SearchContainer>

      <Styled.TableContainer>
        <Styled.Table>
          <Styled.TableHead>
            <tr>
              <Styled.TableHeaderCell $sortable>
                Категория <Styled.SortIcon>↑</Styled.SortIcon>
              </Styled.TableHeaderCell>
              <Styled.TableHeaderCell>Кол-во ингредиентов</Styled.TableHeaderCell>
              <Styled.TableHeaderCell>
                Остатки на всех складах
              </Styled.TableHeaderCell>
              <Styled.TableHeaderCell>
                Стоимость остатков с НДС
              </Styled.TableHeaderCell>
              <Styled.TableHeaderCell style={{ width: '100px' }}></Styled.TableHeaderCell>
            </tr>
          </Styled.TableHead>
          <Styled.TableBody>
            {categoriesList.length === 0 ? (
              <tr>
                <Styled.TableCell colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  Нет категорий
                </Styled.TableCell>
              </tr>
            ) : (
              <>
                {categoriesList.map((category) => (
                  <Styled.TableRow key={category.id}>
                    <Styled.TableCell>{category.name}</Styled.TableCell>
                    <Styled.TableCell>0 шт.</Styled.TableCell>
                    <Styled.TableCell></Styled.TableCell>
                    <Styled.TableCell>0,00 ₽</Styled.TableCell>
                    <Styled.TableCell>
                      <Styled.RowActions>
                        <Styled.EditLink onClick={() => handleEdit(category.id)}>
                          Ред.
                        </Styled.EditLink>
                        <Styled.MoreButton onClick={() => handleDelete(category.id)}>
                          ⋯
                        </Styled.MoreButton>
                      </Styled.RowActions>
                    </Styled.TableCell>
                  </Styled.TableRow>
                ))}
                <Styled.TotalRow>
                  <Styled.TableCell>Итого</Styled.TableCell>
                  <Styled.TableCell>
                    {totalIngredientCount} шт.
                  </Styled.TableCell>
                  <Styled.TableCell></Styled.TableCell>
                  <Styled.TableCell></Styled.TableCell>
                  <Styled.TableCell></Styled.TableCell>
                </Styled.TotalRow>
              </>
            )}
          </Styled.TableBody>
        </Styled.Table>
      </Styled.TableContainer>

      <AddIngredientCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleCategoryCreated}
      />
    </Styled.PageContainer>
  )
}

