import { useAddAccountModal } from '../hooks/useAddAccountModal'
import type { AddAccountModalProps } from '../model/types'
import { useGetAccountTypes } from '@restaurant-pos/api-client'
import * as Styled from './styled'

export const AddAccountModal = (props: AddAccountModalProps) => {
  const { data: accountTypes = [] } = useGetAccountTypes()
  const {
    formData,
    isSubmitting,
    error,
    handleFieldChange,
    handleSubmit,
    handleClose,
  } = useAddAccountModal(props)

  const modalTitle = props.editingAccount ? 'Редактирование счета' : 'Добавление счета'

  if (!props.isOpen) {
    return null
  }

  return (
    <Styled.Overlay $isOpen={props.isOpen} onClick={handleClose}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.ModalTitle>{modalTitle}</Styled.ModalTitle>
          <Styled.CloseButton onClick={handleClose}>×</Styled.CloseButton>
        </Styled.ModalHeader>
        <Styled.ModalBody>
          <Styled.Form onSubmit={handleSubmit}>
            <Styled.InputGroup>
              <Styled.Label>
                Название счета <Styled.Required>*</Styled.Required>
              </Styled.Label>
              <Styled.TextInput
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Введите название счета"
                disabled={isSubmitting}
                required
              />
            </Styled.InputGroup>

            <Styled.InputGroup>
              <Styled.Label>Валюта</Styled.Label>
              <Styled.InputWrapper>
                <Styled.Select
                  value={formData.currency}
                  onChange={(e) => handleFieldChange('currency', e.target.value)}
                  disabled
                >
                  <option value="RUB">RUB</option>
                </Styled.Select>
                <Styled.CurrencyBadge>₽</Styled.CurrencyBadge>
              </Styled.InputWrapper>
            </Styled.InputGroup>

            <Styled.InputGroup>
              <Styled.Label>
                Тип <Styled.Required>*</Styled.Required>
              </Styled.Label>
              <Styled.Select
                value={formData.typeId}
                onChange={(e) => handleFieldChange('typeId', e.target.value)}
                disabled={isSubmitting}
                required
              >
                {accountTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.displayName || type.name}
                  </option>
                ))}
              </Styled.Select>
            </Styled.InputGroup>

            <Styled.InputGroup>
              <Styled.Label>Баланс</Styled.Label>
              <Styled.InputWrapper>
                <Styled.NumberInput
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.balance}
                  onChange={(e) =>
                    handleFieldChange(
                      'balance',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                  disabled={isSubmitting || props.editingAccount !== undefined}
                />
                <Styled.CurrencyBadge>₽</Styled.CurrencyBadge>
              </Styled.InputWrapper>
            </Styled.InputGroup>

            {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}

            <Styled.ButtonGroup>
              <Styled.CancelButton type="button" onClick={handleClose} disabled={isSubmitting}>
                Отмена
              </Styled.CancelButton>
              <Styled.SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Сохранение...'
                  : props.editingAccount
                    ? 'Сохранить'
                    : 'Добавить'}
              </Styled.SubmitButton>
            </Styled.ButtonGroup>
          </Styled.Form>
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}
