import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductCategories } from '../hooks/useProductCategories'
import { Input } from '@restaurant-pos/ui'
import { getCategoryIconComponent, getCategoryTypeLabel } from '../lib/categoryHelpers'
import { AddCategoryModal } from '../../../features/add-category-modal'
import type { ProductCategory } from '@restaurant-pos/api-client'
import * as Styled from './styled'

export const ProductCategories = () => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<ProductCategory | undefined>()
  const {
    categories,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    handleDeleteCategory,
    isDeleting,
    refetchCategories,
  } = useProductCategories()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    handleFilterChange({ search: value || undefined })
  }

  const handleBack = () => {
    window.history.back()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      await handleDeleteCategory(id)
    }
  }

  const handleOpenModal = () => {
    setCategoryToEdit(undefined)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCategoryToEdit(undefined)
  }

  const handleEditCategory = (category: ProductCategory) => {
    setCategoryToEdit(category)
    setIsModalOpen(true)
  }

  const handleCategoryCreated = () => {
    refetchCategories()
  }

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

  const hasCategories = categories && categories.length > 0
  const filteredCategories = categories || []

  const renderCategoryIcon = (type: string) => {
    const IconComponent = getCategoryIconComponent(type)
    return <IconComponent style={{ width: '16px', height: '16px' }} />
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Категории товаров и тех. карт</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderActions>
          <Styled.DeleteButton>🗑️</Styled.DeleteButton>
          <Styled.AddButton onClick={handleOpenModal}>
            Добавить
          </Styled.AddButton>
        </Styled.HeaderActions>
      </Styled.Header>

      {!hasCategories && (
        <Styled.EmptyStateContainer>
          <Styled.EmptyStateTitle>
            <span>✓</span> Добавьте категорию
          </Styled.EmptyStateTitle>
          <Styled.EmptyStateImage
            src="https://via.placeholder.com/200x150?text=Bento+Box"
            alt="Bento box"
          />
          <Styled.EmptyStateDescription>
            Добавьте категории товаров и блюд, чтобы официант быстрее находил их на кассе.
            Например, «Первые блюда», «Выпечка» и «Напитки». Во вкладке{' '}
            <Styled.EmptyStateLink onClick={() => navigate('/statistics')}>Статистика</Styled.EmptyStateLink> →{' '}
            <Styled.EmptyStateLink onClick={() => navigate('/statistics/categories')}>Категории</Styled.EmptyStateLink>{' '}
            смотрите статистику продаж и food cost по этим категориям.
          </Styled.EmptyStateDescription>
          <Styled.AddButton onClick={handleOpenModal} style={{ marginTop: '1rem' }}>
            Продолжить
          </Styled.AddButton>
        </Styled.EmptyStateContainer>
      )}

      {hasCategories && (
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

          <Styled.CategoriesList>
            <Styled.ListHeader>Название</Styled.ListHeader>
            {filteredCategories.map((category) => (
              <Styled.CategoryRow key={category.id}>
                <Styled.CategoryIcon>{renderCategoryIcon(category.type)}</Styled.CategoryIcon>
                <Styled.CategoryName>{category.name}</Styled.CategoryName>
                <Styled.CategoryActions>
                  <Styled.EditButton onClick={() => handleEditCategory(category)}>Ред.</Styled.EditButton>
                  <Styled.MoreButton onClick={() => handleDelete(category.id)}>
                    ⋯
                  </Styled.MoreButton>
                </Styled.CategoryActions>
              </Styled.CategoryRow>
            ))}
          </Styled.CategoriesList>
        </>
      )}

      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleCategoryCreated}
        categoryToEdit={categoryToEdit}
      />
    </Styled.PageContainer>
  )
}
