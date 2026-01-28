import { useNavigate } from 'react-router-dom'
import { useSemiFinished } from '../hooks/useSemiFinished'
import { Input } from '@restaurant-pos/ui'
import { translateUnit } from '../../technical-cards/lib/unitTranslator'
import * as Styled from './styled'

export const SemiFinished = () => {
  const navigate = useNavigate()
  const {
    semiFinishedProducts,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    handleDeleteSemiFinished,
    isDeleting,
  } = useSemiFinished()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    handleFilterChange({ search: value || undefined })
  }

  const handleBack = () => {
    window.history.back()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот полуфабрикат?')) {
      await handleDeleteSemiFinished(id)
    }
  }

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка полуфабрикатов...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке полуфабрикатов: {error.message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  const hasProducts = semiFinishedProducts && semiFinishedProducts.length > 0
  const filteredProducts = semiFinishedProducts || []

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Полуфабрикаты</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderActions>
          <Styled.DeleteButton>🗑️</Styled.DeleteButton>
          <Styled.AddButton onClick={() => navigate('/menu/semi-finished/add')}>
            Добавить
          </Styled.AddButton>
        </Styled.HeaderActions>
      </Styled.Header>

      {!hasProducts && (
        <Styled.EmptyStateContainer>
          <Styled.EmptyStateTitle>
            <span>📦</span> Добавьте полуфабрикат
          </Styled.EmptyStateTitle>
          <Styled.EmptyStateImage
            src="https://via.placeholder.com/200x150?text=Semi+Finished"
            alt="Semi finished products"
          />
          <Styled.EmptyStateDescription>
            Добавьте полуфабрикаты для оптимизации процесса приготовления блюд.
            Это поможет сократить время подготовки заказа и обеспечить стабильность качества.
            Во вкладке{' '}
            <Styled.EmptyStateLink onClick={() => navigate('/statistics')}>Статистика</Styled.EmptyStateLink> →{' '}
            <Styled.EmptyStateLink onClick={() => navigate('/statistics/semi-finished')}>Полуфабрикаты</Styled.EmptyStateLink>{' '}
            смотрите статистику использования и food cost по полуфабрикатам.
          </Styled.EmptyStateDescription>
          <Styled.AddButton onClick={() => navigate('/menu/semi-finished/add')} style={{ marginTop: '16px' }}>
            Продолжить
          </Styled.AddButton>
        </Styled.EmptyStateContainer>
      )}

      {hasProducts && (
        <>
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
          </Styled.SearchContainer>

          <Styled.SemiFinishedList>
            <Styled.ListHeader>
              <span>Название</span>
              <span>Категория</span>
              <span>Ед. изм.</span>
              <span>Кол-во</span>
              <span>Стоимость</span>
              <span>Действия</span>
            </Styled.ListHeader>
            {filteredProducts.map((product) => (
              <Styled.SemiFinishedRow key={product.id}>
                <Styled.SemiFinishedName>{product.name}</Styled.SemiFinishedName>
                <Styled.SemiFinishedCategory>{product.category}</Styled.SemiFinishedCategory>
                <Styled.SemiFinishedUnit>{translateUnit(product.unit)}</Styled.SemiFinishedUnit>
                <Styled.SemiFinishedQuantity>{product.quantity}</Styled.SemiFinishedQuantity>
                <Styled.SemiFinishedCost>{product.cost} ₽</Styled.SemiFinishedCost>
                <Styled.SemiFinishedActions>
                  <Styled.EditButton onClick={() => {}}>Ред.</Styled.EditButton>
                  <Styled.MoreButton onClick={() => handleDelete(product.id)}>
                    ⋯
                  </Styled.MoreButton>
                </Styled.SemiFinishedActions>
              </Styled.SemiFinishedRow>
            ))}
          </Styled.SemiFinishedList>
        </>
      )}
    </Styled.PageContainer>
  )
}