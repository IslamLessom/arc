import { useEffect, useRef } from 'react'
import { useAddEmployeeModal } from '../hooks/useAddEmployeeModal'
import type { AddEmployeeModalProps } from '../model/types'
import { Button, ButtonSize, ButtonVariant } from '@restaurant-pos/ui'
import { Alert } from 'antd'
import { getRoleName } from '../lib/roleMap'
import * as Styled from './styled'

export const AddEmployeeModal = (props: AddEmployeeModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLInputElement>(null)

  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    roles,
    handleFieldChange,
    handleSubmit,
    handleClose,
  } = useAddEmployeeModal(props)

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
              {props.employeeId ? 'Редактирование сотрудника' : 'Добавление сотрудника'}
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
                  Имя сотрудника <Styled.Required>*</Styled.Required>
                </Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    ref={firstFocusableRef}
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Введите имя сотрудника"
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
                <Styled.RowLabel>
                  Пин-код для кассы <Styled.Required>*</Styled.Required>
                </Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    value={formData.pin}
                    onChange={(e) => handleFieldChange('pin', e.target.value)}
                    placeholder="Введите пин-код (4 цифры)"
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.pin}
                    maxLength={4}
                  />
                  {fieldErrors?.pin && (
                    <Styled.FieldError>{fieldErrors.pin}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>
                  Должность <Styled.Required>*</Styled.Required>
                </Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledSelect
                    value={formData.role_id}
                    onChange={(e) => handleFieldChange('role_id', e.target.value)}
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.role_id}
                  >
                    <option value="">Выберите должность</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {getRoleName(role.name)}
                      </option>
                    ))}
                  </Styled.StyledSelect>
                  {fieldErrors?.role_id && (
                    <Styled.FieldError>{fieldErrors.role_id}</Styled.FieldError>
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
                    : props.employeeId
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
