import { useEffect, useRef } from 'react'
import { useAddCustomerGroupModal } from '../hooks/useAddCustomerGroupModal'
import type { AddCustomerGroupModalProps } from '../model/types'
import { Alert } from 'antd'
import * as Styled from './styled'

export const AddCustomerGroupModal = (props: AddCustomerGroupModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLInputElement>(null)

  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    isLoadingGroups,
    handleFieldChange,
    handleSubmit,
    handleClose,
  } = useAddCustomerGroupModal(props)

  // Focus trap implementation
  useEffect(() => {
    if (!props.isOpen) return

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleTabKey)
    document.addEventListener('keydown', handleEscape)

    // Focus on first input when modal opens
    setTimeout(() => {
      firstFocusableRef.current?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleTabKey)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [props.isOpen, isSubmitting, handleClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (props.isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [props.isOpen])

  if (!props.isOpen) {
    return null
  }

  return (
    <Styled.Overlay $isOpen={props.isOpen} onClick={handleClose} aria-hidden={!props.isOpen}>
      <Styled.ModalContainer
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <Styled.PageHeader>
          <Styled.HeaderLeft>
            <Styled.BackButton
              type="button"
              onClick={handleClose}
              aria-label="Закрыть модальное окно"
            >
              ←
            </Styled.BackButton>
            <Styled.HeaderTitle id="modal-title">
              {props.groupId ? 'Редактирование группы' : 'Добавление группы'}
            </Styled.HeaderTitle>
          </Styled.HeaderLeft>
        </Styled.PageHeader>

        <Styled.ModalBody>
          {error && (
            <Alert
              message="Ошибка"
              description={error}
              type="error"
              closable
              style={{ marginBottom: '16px' }}
            />
          )}

          <Styled.Form onSubmit={handleSubmit}>
            <Styled.FormRows>
              <Styled.FormRow>
                <Styled.RowLabel>
                  Название группы <Styled.Required>*</Styled.Required>
                </Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    ref={firstFocusableRef}
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Введите название группы"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.name}
                  />
                  {fieldErrors?.name && (
                    <Styled.FieldError>{fieldErrors.name}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Описание</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Описание группы"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.description}
                  />
                  {fieldErrors?.description && (
                    <Styled.FieldError>{fieldErrors.description}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>
                  Скидка (%) <Styled.Required>*</Styled.Required>
                </Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discount_percentage}
                    onChange={(e) => handleFieldChange('discount_percentage', e.target.value)}
                    placeholder="0"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.discount_percentage}
                  />
                  {fieldErrors?.discount_percentage && (
                    <Styled.FieldError>{fieldErrors.discount_percentage}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Мин. заказов</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    type="number"
                    min="0"
                    value={formData.min_orders}
                    onChange={(e) => handleFieldChange('min_orders', e.target.value)}
                    placeholder="Минимальное количество заказов"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.min_orders}
                  />
                  {fieldErrors?.min_orders && (
                    <Styled.FieldError>{fieldErrors.min_orders}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Мин. сумма</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.min_spent}
                    onChange={(e) => handleFieldChange('min_spent', e.target.value)}
                    placeholder="Минимальная сумма покупок"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.min_spent}
                  />
                  {fieldErrors?.min_spent && (
                    <Styled.FieldError>{fieldErrors.min_spent}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>
            </Styled.FormRows>

            <Styled.ModalFooter>
              <Styled.FooterActions>
                <button
                  htmlType="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  Отмена
                </button>
                <Styled.SaveButton
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  $disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting
                    ? 'Сохранение...'
                    : props.groupId
                    ? 'Сохранить изменения'
                    : 'Сохранить'}
                </Styled.SaveButton>
              </Styled.FooterActions>
            </Styled.ModalFooter>
          </Styled.Form>
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}
