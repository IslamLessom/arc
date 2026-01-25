import { useAddIngredientCategoryModal } from '../hooks/useAddIngredientCategoryModal'
import type { AddIngredientCategoryModalProps } from '../model/types'
import { Button, Input } from '@restaurant-pos/ui'
import * as Styled from './styled'

export const AddIngredientCategoryModal = (props: AddIngredientCategoryModalProps) => {
  const {
    formData,
    isLoading,
    isSubmitting,
    error,
    handleFieldChange,
    handleSubmit,
    handleClose,
  } = useAddIngredientCategoryModal(props)

  if (!props.isOpen) {
    return null
  }

  return (
    <Styled.ModalOverlay $isOpen={props.isOpen} onClick={handleClose}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.ModalHeaderLeft>
            <Styled.ModalBackButton onClick={handleClose}>←</Styled.ModalBackButton>
            <Styled.ModalTitle>Добавление категории ингредиентов</Styled.ModalTitle>
          </Styled.ModalHeaderLeft>
        </Styled.ModalHeader>
        <Styled.ModalBody>
          <Styled.ModalForm onSubmit={handleSubmit}>
            <Styled.ModalInputGroup>
              <Styled.ModalLabel>
                Название <Styled.ModalRequired>*</Styled.ModalRequired>
              </Styled.ModalLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Например, «Овощи» или «Мясо»"
                disabled={isSubmitting}
                required
              />
            </Styled.ModalInputGroup>

            {error && <Styled.ModalErrorMessage>{error}</Styled.ModalErrorMessage>}

            <Styled.ModalButtonGroup>
              <Button htmlType="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </Styled.ModalButtonGroup>
          </Styled.ModalForm>
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.ModalOverlay>
  )
}