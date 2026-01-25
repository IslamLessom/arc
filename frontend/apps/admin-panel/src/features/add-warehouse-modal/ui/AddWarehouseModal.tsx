import { useEffect, useRef } from 'react'
import { useAddWarehouseModal } from '../hooks/useAddWarehouseModal'
import type { AddWarehouseModalProps } from '../model/types'
import { Button, ButtonSize, ButtonVariant } from '@restaurant-pos/ui'
import { Alert } from 'antd'
import * as Styled from './styled'

export const AddWarehouseModal = (props: AddWarehouseModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLInputElement>(null)

  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    establishments,
    handleFieldChange,
    handleEstablishmentToggle,
    handleSubmit,
    handleClose,
  } = useAddWarehouseModal(props)

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
              {props.warehouseId ? 'Редактирование склада' : 'Добавление склада'}
            </Styled.HeaderTitle>
          </Styled.HeaderLeft>
        </Styled.PageHeader>

        <Styled.ModalBody>
          <Styled.InfoBanner>
            Если на разных складах заведения хранятся одинаковые ингредиенты — например, лимон на
            Кухне и на Баре — настройте правила их списания
          </Styled.InfoBanner>

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
                  Название <Styled.Required>*</Styled.Required>
                </Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    ref={firstFocusableRef}
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Введите название"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.name}
                  />
                  {fieldErrors?.name && (
                    <Styled.FieldError>{fieldErrors.name}</Styled.FieldError>
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
                <Styled.RowLabel>Заведения</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.EstablishmentsSection>
                    <Styled.EstablishmentsList>
                      {establishments.map((establishment) => (
                        <Styled.EstablishmentCheckbox key={establishment.id}>
                          <input
                            type="checkbox"
                            checked={formData.establishmentIds.includes(establishment.id)}
                            onChange={() => handleEstablishmentToggle(establishment.id)}
                            disabled={isSubmitting}
                          />
                          {establishment.name}
                        </Styled.EstablishmentCheckbox>
                      ))}
                    </Styled.EstablishmentsList>
                    <Styled.EstablishmentHint>
                      Выберите заведения, чтобы привязать к ним новый склад
                    </Styled.EstablishmentHint>
                  </Styled.EstablishmentsSection>
                </Styled.RowContent>
              </Styled.FormRow>
            </Styled.FormRows>
          </Styled.Form>
        </Styled.ModalBody>

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
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              $disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting
                ? 'Сохранение...'
                : props.warehouseId
                ? 'Сохранить изменения'
                : 'Сохранить'}
            </Styled.SaveButton>
          </Styled.FooterActions>
        </Styled.ModalFooter>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}

