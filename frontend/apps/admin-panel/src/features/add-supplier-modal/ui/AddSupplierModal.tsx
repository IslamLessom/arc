import { useEffect, useRef } from 'react'
import { useAddSupplierModal } from '../hooks/useAddSupplierModal'
import type { AddSupplierModalProps } from '../model/types'
import { Button, ButtonSize, ButtonVariant } from '@restaurant-pos/ui'
import { Alert } from 'antd'
import * as Styled from './styled'

export const AddSupplierModal = (props: AddSupplierModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLInputElement>(null)

  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    handleFieldChange,
    handleSubmit,
    handleClose,
  } = useAddSupplierModal(props)

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
              {props.supplierId ? 'Редактирование карточки поставщика' : 'Добавление карточки поставщика'}
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
                  Имя <Styled.Required>*</Styled.Required>
                </Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    ref={firstFocusableRef}
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Введите имя"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.name}
                  />
                  {fieldErrors?.name && (
                    <Styled.FieldError>{fieldErrors.name}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Номер налогоплательщика</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    value={formData.taxpayer_number}
                    onChange={(e) => handleFieldChange('taxpayer_number', e.target.value)}
                    placeholder="Введите номер налогоплательщика"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.taxpayer_number}
                  />
                  {fieldErrors?.taxpayer_number && (
                    <Styled.FieldError>{fieldErrors.taxpayer_number}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Телефон</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="Введите телефон"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.phone}
                  />
                  {fieldErrors?.phone && (
                    <Styled.FieldError>{fieldErrors.phone}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Адрес</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.TextArea
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    placeholder="Введите адрес"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.address}
                  />
                  {fieldErrors?.address && (
                    <Styled.FieldError>{fieldErrors.address}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Комментарий</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.TextArea
                    value={formData.comment}
                    onChange={(e) => handleFieldChange('comment', e.target.value)}
                    placeholder="Введите комментарий"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.comment}
                  />
                  {fieldErrors?.comment && (
                    <Styled.FieldError>{fieldErrors.comment}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>
            </Styled.FormRows>

            <Styled.ModalFooter>
              <Styled.FooterActions>
                <Button
                  htmlType="button"
                  size={ButtonSize.Large}
                  variant={ButtonVariant.Outline}
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Styled.SaveButton
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  $disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting
                    ? 'Сохранение...'
                    : props.supplierId
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

