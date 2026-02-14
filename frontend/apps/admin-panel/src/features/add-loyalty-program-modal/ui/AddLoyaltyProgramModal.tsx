import { useEffect, useRef } from 'react'
import { Alert } from 'antd'
import { useAddLoyaltyProgramModal } from '../hooks/useAddLoyaltyProgramModal'
import type { AddLoyaltyProgramModalProps } from '../model/types'
import * as Styled from './styled'

export const AddLoyaltyProgramModal = (props: AddLoyaltyProgramModalProps) => {
  const firstInputRef = useRef<HTMLInputElement>(null)

  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    handleFieldChange,
    handleSubmit,
    handleClose,
  } = useAddLoyaltyProgramModal(props)

  useEffect(() => {
    if (!props.isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setTimeout(() => firstInputRef.current?.focus(), 50)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) handleClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [props.isOpen, isSubmitting, handleClose])

  if (!props.isOpen) return null

  return (
    <Styled.Overlay $isOpen={props.isOpen} onClick={handleClose}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.PageHeader>
          <Styled.HeaderLeft>
            <Styled.BackButton type="button" onClick={handleClose}>←</Styled.BackButton>
            <Styled.HeaderTitle>
              {props.programId ? 'Редактирование программы' : 'Добавление программы'}
            </Styled.HeaderTitle>
          </Styled.HeaderLeft>
        </Styled.PageHeader>

        <Styled.ModalBody>
          {error && <Alert type="error" message="Ошибка" description={error} style={{ marginBottom: 12 }} />}

          <Styled.Form onSubmit={handleSubmit}>
            <Styled.FormRows>
              <Styled.FormRow>
                <Styled.RowLabel>Название <Styled.Required>*</Styled.Required></Styled.RowLabel>
                <Styled.StyledInput
                  ref={firstInputRef}
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  $hasError={!!fieldErrors.name}
                />
                {fieldErrors.name && <Styled.FieldError>{fieldErrors.name}</Styled.FieldError>}
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Описание</Styled.RowLabel>
                <Styled.StyledTextarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                />
              </Styled.FormRow>

              <Styled.TwoCols>
                <Styled.FormRow>
                  <Styled.RowLabel>Тип</Styled.RowLabel>
                  <Styled.StyledSelect
                    value={formData.type}
                    onChange={(e) => handleFieldChange('type', e.target.value as typeof formData.type)}
                  >
                    <option value="points">Баллы</option>
                    <option value="cashback">Кэшбэк</option>
                    <option value="tier">Уровни</option>
                  </Styled.StyledSelect>
                </Styled.FormRow>

                <Styled.FormRow>
                  <Styled.RowLabel>Мультипликатор</Styled.RowLabel>
                  <Styled.StyledInput
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={formData.point_multiplier}
                    onChange={(e) => handleFieldChange('point_multiplier', e.target.value)}
                    $hasError={!!fieldErrors.point_multiplier}
                  />
                  {fieldErrors.point_multiplier && <Styled.FieldError>{fieldErrors.point_multiplier}</Styled.FieldError>}
                </Styled.FormRow>
              </Styled.TwoCols>

              {formData.type === 'points' && (
                <Styled.FormRow>
                  <Styled.RowLabel>Баллов на 1 единицу валюты</Styled.RowLabel>
                  <Styled.StyledInput
                    type="number"
                    min="1"
                    value={formData.points_per_currency}
                    onChange={(e) => handleFieldChange('points_per_currency', e.target.value)}
                    $hasError={!!fieldErrors.points_per_currency}
                  />
                  {fieldErrors.points_per_currency && <Styled.FieldError>{fieldErrors.points_per_currency}</Styled.FieldError>}
                </Styled.FormRow>
              )}

              {formData.type === 'cashback' && (
                <Styled.TwoCols>
                  <Styled.FormRow>
                    <Styled.RowLabel>Кэшбэк %</Styled.RowLabel>
                    <Styled.StyledInput
                      type="number"
                      min="0"
                      max="100"
                      value={formData.cashback_percentage}
                      onChange={(e) => handleFieldChange('cashback_percentage', e.target.value)}
                      $hasError={!!fieldErrors.cashback_percentage}
                    />
                    {fieldErrors.cashback_percentage && <Styled.FieldError>{fieldErrors.cashback_percentage}</Styled.FieldError>}
                  </Styled.FormRow>
                  <Styled.FormRow>
                    <Styled.RowLabel>Макс. кэшбэк</Styled.RowLabel>
                    <Styled.StyledInput
                      type="number"
                      min="0"
                      value={formData.max_cashback_amount}
                      onChange={(e) => handleFieldChange('max_cashback_amount', e.target.value)}
                    />
                  </Styled.FormRow>
                </Styled.TwoCols>
              )}

              {props.programId && (
                <Styled.CheckboxRow>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleFieldChange('active', e.target.checked)}
                  />
                  Активная программа
                </Styled.CheckboxRow>
              )}
            </Styled.FormRows>

            <Styled.ModalFooter>
              <Styled.CancelButton type="button" onClick={handleClose} disabled={isSubmitting}>Отмена</Styled.CancelButton>
              <Styled.SaveButton type="submit" $disabled={!isFormValid || isSubmitting} disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? 'Сохранение...' : props.programId ? 'Сохранить' : 'Добавить'}
              </Styled.SaveButton>
            </Styled.ModalFooter>
          </Styled.Form>
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}
