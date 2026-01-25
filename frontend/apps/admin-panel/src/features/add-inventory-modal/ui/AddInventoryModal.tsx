import { useEffect, useRef } from 'react'
import { useAddInventoryModal } from '../hooks/useAddInventoryModal'
import type { AddInventoryModalProps } from '../model/types'
import { Button, ButtonSize, ButtonVariant } from '@restaurant-pos/ui'
import { Alert } from 'antd'
import * as Styled from './styled'

export const AddInventoryModal = (props: AddInventoryModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLSelectElement>(null)

  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    warehouses,
    handleFieldChange,
    handleCheckTypeChange,
    handleTypeChange,
    handleSubmit,
    handleClose,
  } = useAddInventoryModal(props)

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

  // Форматируем время для отображения
  const [hours, minutes] = formData.time.split(':')

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
            <Styled.HeaderTitle id="modal-title">Добавление инвентаризации</Styled.HeaderTitle>
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
                  Склад <Styled.Required>*</Styled.Required>
                </Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledSelect
                    ref={firstFocusableRef}
                    value={formData.warehouse_id}
                    onChange={(e) => handleFieldChange('warehouse_id', e.target.value)}
                    disabled={isSubmitting}
                    $hasError={!!fieldErrors?.warehouse_id}
                  >
                    <option value="">Выберите склад</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </Styled.StyledSelect>
                  {fieldErrors?.warehouse_id && (
                    <Styled.FieldError>{fieldErrors.warehouse_id}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Проверка остатков</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.OptionGroup>
                    <Styled.OptionButton
                      type="button"
                      $isSelected={formData.checkType === 'retroactive'}
                      onClick={() => handleCheckTypeChange('retroactive')}
                      disabled={isSubmitting}
                    >
                      Задним числом
                    </Styled.OptionButton>
                    <Styled.OptionButton
                      type="button"
                      $isSelected={formData.checkType === 'at_time'}
                      onClick={() => handleCheckTypeChange('at_time')}
                      disabled={isSubmitting}
                    >
                      Временем проведения
                    </Styled.OptionButton>
                  </Styled.OptionGroup>
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>
                  Дата и время инвентаризации <Styled.Required>*</Styled.Required>
                </Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.DateTimeContainer>
                    <Styled.DateInput
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFieldChange('date', e.target.value)}
                      disabled={isSubmitting}
                      $hasError={!!fieldErrors?.date}
                    />
                    <Styled.TimeInputs>
                      <Styled.TimeInput
                        type="number"
                        min="0"
                        max="23"
                        value={hours}
                        onChange={(e) => {
                          const h = e.target.value.padStart(2, '0')
                          handleFieldChange('time', `${h}:${minutes}`)
                        }}
                        disabled={isSubmitting}
                        $hasError={!!fieldErrors?.time}
                      />
                      <Styled.TimeSeparator>:</Styled.TimeSeparator>
                      <Styled.TimeInput
                        type="number"
                        min="0"
                        max="59"
                        value={minutes}
                        onChange={(e) => {
                          const m = e.target.value.padStart(2, '0')
                          handleFieldChange('time', `${hours}:${m}`)
                        }}
                        disabled={isSubmitting}
                        $hasError={!!fieldErrors?.time}
                      />
                    </Styled.TimeInputs>
                  </Styled.DateTimeContainer>
                  {(fieldErrors?.date || fieldErrors?.time) && (
                    <Styled.FieldError>{fieldErrors.date || fieldErrors.time}</Styled.FieldError>
                  )}
                </Styled.RowContent>
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Тип инвентаризации</Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.OptionGroup>
                    <Styled.OptionButton
                      type="button"
                      $isSelected={formData.type === 'full'}
                      onClick={() => handleTypeChange('full')}
                      disabled={isSubmitting}
                    >
                      Полная
                    </Styled.OptionButton>
                    <Styled.OptionButton
                      type="button"
                      $isSelected={formData.type === 'partial'}
                      onClick={() => handleTypeChange('partial')}
                      disabled={isSubmitting}
                    >
                      Частичная
                    </Styled.OptionButton>
                  </Styled.OptionGroup>
                  {formData.type === 'full' && (
                    <Styled.WarningText>
                      <Styled.InfoIcon>ℹ️</Styled.InfoIcon>
                      Инвентаризационный период будет закрыт
                    </Styled.WarningText>
                  )}
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
              {isSubmitting ? 'Создание...' : 'Создать'}
            </Styled.SaveButton>
          </Styled.FooterActions>
        </Styled.ModalFooter>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}

