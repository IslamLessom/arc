import { useEffect, useRef } from 'react'
import { Alert } from 'antd'
import { useAddPromotionModal } from '../hooks/useAddPromotionModal'
import type { AddPromotionModalProps } from '../model/types'
import * as Styled from './styled'

export const AddPromotionModal = (props: AddPromotionModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
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
  } = useAddPromotionModal(props)

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
      <Styled.ModalContainer ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <Styled.PageHeader>
          <Styled.HeaderLeft>
            <Styled.BackButton type="button" onClick={handleClose}>←</Styled.BackButton>
            <Styled.HeaderTitle>
              {props.promotionId ? 'Редактирование акции' : 'Добавление акции'}
            </Styled.HeaderTitle>
          </Styled.HeaderLeft>
        </Styled.PageHeader>

        <Styled.ModalBody>
          {error && <Alert type="error" message="Ошибка" description={error} style={{ marginBottom: 12 }} />}

          <Styled.Form onSubmit={handleSubmit}>
            <Styled.FormRows>
              <Styled.FormRow>
                <Styled.RowLabel>Название <Styled.Required>*</Styled.Required></Styled.RowLabel>
                <Styled.RowContent>
                  <Styled.StyledInput
                    ref={firstInputRef}
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    $hasError={!!fieldErrors.name}
                  />
                  {fieldErrors.name && <Styled.FieldError>{fieldErrors.name}</Styled.FieldError>}
                </Styled.RowContent>
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
                    <option value="discount">Скидка</option>
                    <option value="buy_x_get_y">X + Y</option>
                    <option value="bundle">Комбо</option>
                    <option value="happy_hour">Happy Hour</option>
                  </Styled.StyledSelect>
                </Styled.FormRow>

                {(formData.type === 'discount' || formData.type === 'happy_hour') && (
                  <Styled.FormRow>
                    <Styled.RowLabel>Скидка %</Styled.RowLabel>
                    <Styled.StyledInput
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => handleFieldChange('discount_percentage', e.target.value)}
                      $hasError={!!fieldErrors.discount_percentage}
                    />
                    {fieldErrors.discount_percentage && <Styled.FieldError>{fieldErrors.discount_percentage}</Styled.FieldError>}
                  </Styled.FormRow>
                )}
              </Styled.TwoCols>

              {formData.type === 'buy_x_get_y' && (
                <Styled.TwoCols>
                  <Styled.FormRow>
                    <Styled.RowLabel>Купить (X)</Styled.RowLabel>
                    <Styled.StyledInput
                      type="number"
                      min="1"
                      value={formData.buy_quantity}
                      onChange={(e) => handleFieldChange('buy_quantity', e.target.value)}
                      $hasError={!!fieldErrors.buy_quantity}
                    />
                    {fieldErrors.buy_quantity && <Styled.FieldError>{fieldErrors.buy_quantity}</Styled.FieldError>}
                  </Styled.FormRow>
                  <Styled.FormRow>
                    <Styled.RowLabel>Получить (Y)</Styled.RowLabel>
                    <Styled.StyledInput
                      type="number"
                      min="1"
                      value={formData.get_quantity}
                      onChange={(e) => handleFieldChange('get_quantity', e.target.value)}
                      $hasError={!!fieldErrors.get_quantity}
                    />
                    {fieldErrors.get_quantity && <Styled.FieldError>{fieldErrors.get_quantity}</Styled.FieldError>}
                  </Styled.FormRow>
                </Styled.TwoCols>
              )}

              <Styled.TwoCols>
                <Styled.FormRow>
                  <Styled.RowLabel>Дата начала <Styled.Required>*</Styled.Required></Styled.RowLabel>
                  <Styled.StyledInput
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleFieldChange('start_date', e.target.value)}
                    $hasError={!!fieldErrors.start_date}
                  />
                  {fieldErrors.start_date && <Styled.FieldError>{fieldErrors.start_date}</Styled.FieldError>}
                </Styled.FormRow>
                <Styled.FormRow>
                  <Styled.RowLabel>Дата окончания <Styled.Required>*</Styled.Required></Styled.RowLabel>
                  <Styled.StyledInput
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleFieldChange('end_date', e.target.value)}
                    $hasError={!!fieldErrors.end_date}
                  />
                  {fieldErrors.end_date && <Styled.FieldError>{fieldErrors.end_date}</Styled.FieldError>}
                </Styled.FormRow>
              </Styled.TwoCols>

              {props.promotionId && (
                <Styled.CheckboxRow>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleFieldChange('active', e.target.checked)}
                  />
                  Активная акция
                </Styled.CheckboxRow>
              )}
            </Styled.FormRows>

            <Styled.ModalFooter>
              <Styled.CancelButton type="button" onClick={handleClose} disabled={isSubmitting}>Отмена</Styled.CancelButton>
              <Styled.SaveButton type="submit" $disabled={!isFormValid || isSubmitting} disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? 'Сохранение...' : props.promotionId ? 'Сохранить' : 'Добавить'}
              </Styled.SaveButton>
            </Styled.ModalFooter>
          </Styled.Form>
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}
