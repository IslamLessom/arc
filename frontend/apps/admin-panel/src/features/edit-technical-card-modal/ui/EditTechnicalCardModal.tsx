import { useEditTechnicalCardModal } from '../hooks/useEditTechnicalCardModal'
import type { EditTechnicalCardModalProps } from '../model/types'
import { Button, Input } from '@restaurant-pos/ui'
import * as Styled from './styled'

export const EditTechnicalCardModal = (props: EditTechnicalCardModalProps) => {
  const {
    formData,
    isLoading,
    isSubmitting,
    error,
    handleFieldChange,
    handleSubmit,
    handleClose,
  } = useEditTechnicalCardModal(props)

  if (!props.isOpen) {
    return null
  }

  if (isLoading) {
    return (
      <Styled.Overlay $isOpen={props.isOpen} onClick={handleClose}>
        <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
          <Styled.ModalHeader>
            <Styled.ModalTitle>Редактирование техкарты</Styled.ModalTitle>
            <Styled.CloseButton onClick={handleClose}>×</Styled.CloseButton>
          </Styled.ModalHeader>
          <Styled.ModalBody>
            <Styled.LoadingContainer>Загрузка...</Styled.LoadingContainer>
          </Styled.ModalBody>
        </Styled.ModalContainer>
      </Styled.Overlay>
    )
  }

  return (
    <Styled.Overlay $isOpen={props.isOpen} onClick={handleClose}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.ModalTitle>Редактирование техкарты</Styled.ModalTitle>
          <Styled.CloseButton onClick={handleClose}>×</Styled.CloseButton>
        </Styled.ModalHeader>
        <Styled.ModalBody>
          <Styled.Form onSubmit={handleSubmit}>
            <Styled.FormSection>
              <Styled.InputGroup>
                <Styled.Label>
                  Название <Styled.Required>*</Styled.Required>
                </Styled.Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Введите название техкарты"
                  disabled={isSubmitting}
                  required
                />
              </Styled.InputGroup>

              <Styled.InputGroup>
                <Styled.Label>
                  Категория <Styled.Required>*</Styled.Required>
                </Styled.Label>
                <Input
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  placeholder="Введите категорию"
                  disabled={isSubmitting}
                  required
                />
              </Styled.InputGroup>

              <Styled.InputGroup>
                <Styled.Label>Количество ингредиентов</Styled.Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.ingredients}
                  onChange={(e) =>
                    handleFieldChange('ingredients', parseInt(e.target.value) || 0)
                  }
                  disabled={isSubmitting}
                />
              </Styled.InputGroup>

              <Styled.InputGroup>
                <Styled.Label>Вес (г)</Styled.Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.weight}
                  onChange={(e) =>
                    handleFieldChange('weight', parseInt(e.target.value) || 0)
                  }
                  disabled={isSubmitting}
                />
              </Styled.InputGroup>

              <Styled.InputGroup>
                <Styled.Label>Себестоимость (₽)</Styled.Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) =>
                    handleFieldChange('cost', parseFloat(e.target.value) || 0)
                  }
                  disabled={isSubmitting}
                />
              </Styled.InputGroup>

              <Styled.InputGroup>
                <Styled.Label>Цена продажи (₽)</Styled.Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    handleFieldChange('price', parseFloat(e.target.value) || 0)
                  }
                  disabled={isSubmitting}
                />
              </Styled.InputGroup>

              <Styled.InputGroup>
                <Styled.Label>Маржа (%)</Styled.Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.margin}
                  onChange={(e) =>
                    handleFieldChange('margin', parseFloat(e.target.value) || 0)
                  }
                  disabled={isSubmitting}
                />
              </Styled.InputGroup>

              <Styled.InputGroup>
                <Styled.Label>Статус</Styled.Label>
                <Styled.Select
                  value={formData.status}
                  onChange={(e) =>
                    handleFieldChange('status', e.target.value as 'active' | 'inactive')
                  }
                  disabled={isSubmitting}
                >
                  <option value="active">Активна</option>
                  <option value="inactive">Неактивна</option>
                </Styled.Select>
              </Styled.InputGroup>
            </Styled.FormSection>

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
