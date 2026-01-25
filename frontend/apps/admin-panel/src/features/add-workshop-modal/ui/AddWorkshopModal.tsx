import { useAddWorkshopModal } from '../hooks/useAddWorkshopModal'
import type { AddWorkshopModalProps } from '../model/types'
import * as Styled from './styled'

export const AddWorkshopModal = (props: AddWorkshopModalProps) => {
  const {
    formData,
    isLoading,
    isSubmitting,
    error,
    handleFieldChange,
    handleSubmit,
    handleClose,
  } = useAddWorkshopModal(props)

  if (!props.isOpen) {
    return null
  }

  return (
    <Styled.ModalOverlay $isOpen={props.isOpen} onClick={handleClose}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.ModalHeaderLeft>
            <Styled.ModalBackButton onClick={handleClose}>←</Styled.ModalBackButton>
            <Styled.ModalTitle>
              {props.workshopId ? 'Редактирование цеха' : 'Добавление цеха'}
            </Styled.ModalTitle>
          </Styled.ModalHeaderLeft>
        </Styled.ModalHeader>
        <Styled.ModalBody>
          <Styled.ModalForm onSubmit={handleSubmit}>
            <Styled.ModalInputGroup>
              <Styled.ModalLabel>
                Название <Styled.ModalRequired>*</Styled.ModalRequired>
              </Styled.ModalLabel>
              <Styled.ModalInput
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Например, «Кухня»"
                disabled={isSubmitting || isLoading}
                required
              />
            </Styled.ModalInputGroup>

            <Styled.ModalInputGroup>
              <Styled.ModalCheckboxGroup>
                <Styled.ModalCheckbox
                  type="checkbox"
                  id="print_slips"
                  checked={formData.print_slips}
                  onChange={(e) => handleFieldChange('print_slips', e.target.checked)}
                  disabled={isSubmitting || isLoading}
                />
                <Styled.ModalCheckboxLabel htmlFor="print_slips">
                  Печатать бегунки
                </Styled.ModalCheckboxLabel>
              </Styled.ModalCheckboxGroup>
            </Styled.ModalInputGroup>

            {error && <Styled.ModalErrorMessage>{error}</Styled.ModalErrorMessage>}

            <Styled.ModalButtonGroup>
              <Styled.ModalSubmitButton
                type="submit"
                disabled={isSubmitting || isLoading || !formData.name.trim()}
                $disabled={isSubmitting || isLoading || !formData.name.trim()}
              >
                {isSubmitting ? 'Сохранение...' : 'Добавить'}
              </Styled.ModalSubmitButton>
            </Styled.ModalButtonGroup>
          </Styled.ModalForm>
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.ModalOverlay>
  )
}

