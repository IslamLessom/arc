import { useEffect, useRef } from 'react'
import { useAddCustomerModal } from '../hooks/useAddCustomerModal'
import type { AddCustomerModalProps } from '../model/types'
import { Alert } from 'antd'
import * as Styled from './styled'

export const AddCustomerModal = (props: AddCustomerModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLInputElement>(null)

  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    customerGroups,
    isLoadingCustomers,
    isLoadingGroups,
    handleFieldChange,
    handleSubmit,
    handleClose,
  } = useAddCustomerModal(props)

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
              {props.customerId ? 'Редактирование клиента' : 'Добавление клиента'}
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
                  Имя клиента <Styled.Required>*</Styled.Required>
                </Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    ref={firstFocusableRef}
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Введите имя клиента"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.name}
                  />
                  {fieldErrors?.name && (
                    <Styled.FieldError>{fieldErrors.name}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Номер телефона</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="Введите номер телефона"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.phone}
                  />
                  {fieldErrors?.phone && (
                    <Styled.FieldError>{fieldErrors.phone}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Email</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="Введите email"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.email}
                  />
                  {fieldErrors?.email && (
                    <Styled.FieldError>{fieldErrors.email}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Дата рождения</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => handleFieldChange('birthday', e.target.value)}
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.birthday}
                  />
                  {fieldErrors?.birthday && (
                    <Styled.FieldError>{fieldErrors.birthday}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Группа клиента</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledSelect
                    value={formData.group_id}
                    onChange={(e) => handleFieldChange('group_id', e.target.value)}
                    disabled={isSubmitting || isLoadingGroups}
                    $hasError={!!fieldErrors?.group_id}
                  >
                    <option value="">Выберите группу</option>
                    {customerGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.discount_percentage}% скидка)
                      </option>
                    ))}
                  </Styled.StyledSelect>
                  {fieldErrors?.group_id && (
                    <Styled.FieldError>{fieldErrors.group_id}</Styled.FieldError>
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
                    : props.customerId
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
