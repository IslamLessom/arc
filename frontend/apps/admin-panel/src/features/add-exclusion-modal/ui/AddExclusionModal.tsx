import { useEffect, useRef } from 'react'
import { Alert } from 'antd'
import { useAddExclusionModal } from '../hooks/useAddExclusionModal'
import type { AddExclusionModalProps } from '../model/types'
import * as Styled from './styled'

export const AddExclusionModal = (props: AddExclusionModalProps) => {
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
  } = useAddExclusionModal(props)

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
              {props.exclusionId ? 'Редактирование исключения' : 'Добавление исключения'}
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
                    <option value="product">Товар</option>
                    <option value="category">Категория</option>
                    <option value="customer">Клиент</option>
                    <option value="customer_group">Группа клиентов</option>
                  </Styled.StyledSelect>
                </Styled.FormRow>

                <Styled.FormRow>
                  <Styled.RowLabel>Название объекта</Styled.RowLabel>
                  <Styled.StyledInput
                    value={formData.entity_name}
                    onChange={(e) => handleFieldChange('entity_name', e.target.value)}
                  />
                </Styled.FormRow>
              </Styled.TwoCols>

              <Styled.FormRow>
                <Styled.RowLabel>ID объекта (UUID, необязательно)</Styled.RowLabel>
                <Styled.StyledInput
                  value={formData.entity_id}
                  onChange={(e) => handleFieldChange('entity_id', e.target.value)}
                  $hasError={!!fieldErrors.entity_id}
                />
                {fieldErrors.entity_id && <Styled.FieldError>{fieldErrors.entity_id}</Styled.FieldError>}
              </Styled.FormRow>

              {props.exclusionId && (
                <Styled.CheckboxRow>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleFieldChange('active', e.target.checked)}
                  />
                  Активное исключение
                </Styled.CheckboxRow>
              )}
            </Styled.FormRows>

            <Styled.ModalFooter>
              <Styled.CancelButton type="button" onClick={handleClose} disabled={isSubmitting}>Отмена</Styled.CancelButton>
              <Styled.SaveButton type="submit" $disabled={!isFormValid || isSubmitting} disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? 'Сохранение...' : props.exclusionId ? 'Сохранить' : 'Добавить'}
              </Styled.SaveButton>
            </Styled.ModalFooter>
          </Styled.Form>
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}
