import { useAddCategoryModal } from '../hooks/useAddCategoryModal'
import type { AddCategoryModalProps } from '../model/types'
import { CategoryType, CategoryTypeLabel, MainScreen, MainScreenLabel } from '../model/enums'
import { Button, Input } from '@restaurant-pos/ui'
import * as Styled from './styled'

export const AddCategoryModal = (props: AddCategoryModalProps) => {
  const {
    formData,
    techCardCategories,
    techCardCategoriesLoading,
    isLoading,
    isSubmitting,
    error,
    handleFieldChange,
    handleSubmit,
    handleClose,
  } = useAddCategoryModal(props)

  if (!props.isOpen) {
    return null
  }

  return (
    <Styled.Overlay $isOpen={props.isOpen} onClick={handleClose}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.ModalTitle>
            {props.categoryToEdit ? 'Редактирование категории' : 'Добавление категории товаров и тех. карт'}
          </Styled.ModalTitle>
          <Styled.CloseButton onClick={handleClose}>×</Styled.CloseButton>
        </Styled.ModalHeader>
        <Styled.ModalBody>
          <Styled.Form onSubmit={handleSubmit}>
            <Styled.InputGroup>
              <Styled.Label>
                Название <Styled.Required>*</Styled.Required>
              </Styled.Label>
              <Input
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Например, «Холодные напитки» или «Салаты»"
                disabled={isSubmitting}
                required
              />
            </Styled.InputGroup>

            <Styled.InputGroup>
              <Styled.Label>
                Тип категории <Styled.Required>*</Styled.Required>
              </Styled.Label>
              <Styled.Select
                value={formData.type}
                onChange={(e) =>
                  handleFieldChange('type', e.target.value)
                }
                disabled={isSubmitting || techCardCategoriesLoading}
                required
              >
                <option value={MainScreen.MainScreen}>
                  {MainScreenLabel.MainScreen}
                </option>
                {techCardCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Styled.Select>
            </Styled.InputGroup>

            {formData.type === CategoryType.TechCard && (
              <Styled.InputGroup>
                <Styled.Label>Категория тех. карт</Styled.Label>
                <Styled.Select
                  value={formData.techCardCategory || ''}
                  onChange={(e) => handleFieldChange('techCardCategory', e.target.value)}
                  disabled={isSubmitting || techCardCategoriesLoading}
                >
                  <option value={MainScreen.MainScreen}>
                    {MainScreenLabel.MainScreen}
                  </option>
                  {techCardCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Styled.Select>
              </Styled.InputGroup>
            )}

            <Styled.InputGroup>
              <Styled.Label>Обложка</Styled.Label>
              <Styled.CoverImagePlaceholder>
                Нажмите для загрузки изображения
              </Styled.CoverImagePlaceholder>
            </Styled.InputGroup>

            {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}

            <Styled.ButtonGroup>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button htmlType="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </Styled.ButtonGroup>
          </Styled.Form>
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}

