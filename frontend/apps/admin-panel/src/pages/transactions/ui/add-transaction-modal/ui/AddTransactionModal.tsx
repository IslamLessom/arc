import { useAddTransactionModal } from '../hooks/useAddTransactionModal'
import type { AddTransactionModalProps } from '../model/types'
import { TransactionType, TransactionTypeLabels } from '../model/enums'
import { getCategoriesForType } from '../lib/getTransactionCategories'
import * as Styled from './styled'

export const AddTransactionModal = (props: AddTransactionModalProps) => {
  const {
    formData,
    isSubmitting,
    error,
    accounts,
    handleFieldChange,
    handleTypeChange,
    handleSubmit,
    handleClose,
  } = useAddTransactionModal(props)

  const categoriesForType = getCategoriesForType(formData.type)
  const isTransfer = formData.type === TransactionType.TRANSFER

  if (!props.isOpen) {
    return null
  }

  return (
    <Styled.Overlay $isOpen={props.isOpen} onClick={handleClose}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.ModalTitle>Новая транзакция</Styled.ModalTitle>
          <Styled.CloseButton onClick={handleClose}>×</Styled.CloseButton>
        </Styled.ModalHeader>
        <Styled.ModalBody>
          <Styled.Form onSubmit={handleSubmit}>
            {/* Тип транзакции */}
            <Styled.InputGroup>
              <Styled.Label>
                Тип транзакции <Styled.Required>*</Styled.Required>
              </Styled.Label>
              <Styled.TypeButtons>
                <Styled.TypeButton
                  type="button"
                  $active={formData.type === TransactionType.INCOME}
                  $variant="income"
                  onClick={() => handleTypeChange(TransactionType.INCOME)}
                >
                  Доход
                </Styled.TypeButton>
                <Styled.TypeButton
                  type="button"
                  $active={formData.type === TransactionType.EXPENSE}
                  $variant="expense"
                  onClick={() => handleTypeChange(TransactionType.EXPENSE)}
                >
                  Расход
                </Styled.TypeButton>
                <Styled.TypeButton
                  type="button"
                  $active={formData.type === TransactionType.TRANSFER}
                  $variant="transfer"
                  onClick={() => handleTypeChange(TransactionType.TRANSFER)}
                >
                  Перевод
                </Styled.TypeButton>
              </Styled.TypeButtons>
            </Styled.InputGroup>

            {/* Сумма */}
            <Styled.InputGroup>
              <Styled.Label>
                Сумма <Styled.Required>*</Styled.Required>
              </Styled.Label>
              <Styled.AmountInput
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                placeholder="0.00"
                disabled={isSubmitting}
                required
              />
            </Styled.InputGroup>

            {/* Счета */}
            <Styled.AccountsGroup>
              <Styled.InputGroup>
                <Styled.Label>
                  {isTransfer ? 'Счет списания' : 'Счет'} <Styled.Required>*</Styled.Required>
                </Styled.Label>
                <Styled.Select
                  value={formData.fromAccountId}
                  onChange={(e) => handleFieldChange('fromAccountId', e.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Выберите счет</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.balance.toLocaleString()} ₽)
                    </option>
                  ))}
                </Styled.Select>
              </Styled.InputGroup>

              {isTransfer && (
                <Styled.InputGroup>
                  <Styled.Label>
                    Счет зачисления <Styled.Required>*</Styled.Required>
                  </Styled.Label>
                  <Styled.Select
                    value={formData.toAccountId}
                    onChange={(e) => handleFieldChange('toAccountId', e.target.value)}
                    disabled={isSubmitting}
                    required
                  >
                    <option value="">Выберите счет</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.balance.toLocaleString()} ₽)
                      </option>
                    ))}
                  </Styled.Select>
                </Styled.InputGroup>
              )}
            </Styled.AccountsGroup>

            {/* Категория */}
            {!isTransfer && (
              <Styled.InputGroup>
                <Styled.Label>
                  Категория <Styled.Required>*</Styled.Required>
                </Styled.Label>
                <Styled.Select
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categoriesForType.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Styled.Select>
              </Styled.InputGroup>
            )}

            {/* Дата и время */}
            <Styled.InputGroup>
              <Styled.Label>
                Дата и время <Styled.Required>*</Styled.Required>
              </Styled.Label>
              <Styled.DateTimeGroup>
                <Styled.DateInput
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <Styled.TimeInput
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleFieldChange('time', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </Styled.DateTimeGroup>
            </Styled.InputGroup>

            {/* Комментарий */}
            <Styled.InputGroup>
              <Styled.Label>Комментарий</Styled.Label>
              <Styled.TextInput
                as="textarea"
                value={formData.comment}
                onChange={(e) => handleFieldChange('comment', e.target.value)}
                placeholder="Добавьте комментарий к транзакции"
                disabled={isSubmitting}
              />
            </Styled.InputGroup>

            {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}

            <Styled.ButtonGroup>
              <Styled.CancelButton type="button" onClick={handleClose} disabled={isSubmitting}>
                Отмена
              </Styled.CancelButton>
              <Styled.SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Создание...' : 'Создать'}
              </Styled.SubmitButton>
            </Styled.ButtonGroup>
          </Styled.Form>
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}
