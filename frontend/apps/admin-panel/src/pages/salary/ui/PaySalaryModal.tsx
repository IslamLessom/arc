import { useState } from 'react'
import { useGetAccounts } from '@restaurant-pos/api-client'
import { formatCurrency } from './lib/formatUtils'
import * as Styled from './styled'

interface PaySalaryModalProps {
  employeeId: string
  employeeName: string
  totalSalary: number
  advancesDeducted: number
  amountToPay: number
  periodStart: string
  periodEnd: string
  onClose: () => void
  onConfirm: (accountId: string) => void
  isProcessing: boolean
}

export const PaySalaryModal = ({
  employeeId,
  employeeName,
  totalSalary,
  advancesDeducted,
  amountToPay,
  periodStart,
  periodEnd,
  onClose,
  onConfirm,
  isProcessing,
}: PaySalaryModalProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccounts(undefined, true)

  const handleSubmit = () => {
    if (!selectedAccountId) {
      alert('Выберите счёт для выплаты')
      return
    }

    const selectedAccount = accounts?.find((acc) => acc.id === selectedAccountId)
    if (!selectedAccount) {
      alert('Выбранный счёт не найден')
      return
    }

    if (selectedAccount.balance < amountToPay) {
      alert(
        `Недостаточно средств на счёте. Баланс: ${formatCurrency(selectedAccount.balance)}, требуется: ${formatCurrency(amountToPay)}`
      )
      return
    }

    onConfirm(selectedAccountId)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU')
  }

  return (
    <Styled.ModalOverlay onClick={onClose}>
      <Styled.ModalContent onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.ModalTitle>Выплата зарплаты</Styled.ModalTitle>
          <Styled.CloseButton onClick={onClose}>×</Styled.CloseButton>
        </Styled.ModalHeader>

        <Styled.ModalBody>
          <Styled.InfoBox>
            <Styled.InfoRow>
              <Styled.InfoLabel>Сотрудник:</Styled.InfoLabel>
              <Styled.InfoValue $highlight>{employeeName}</Styled.InfoValue>
            </Styled.InfoRow>
            <Styled.InfoRow>
              <Styled.InfoLabel>Период:</Styled.InfoLabel>
              <Styled.InfoValue>
                {formatDate(periodStart)} - {formatDate(periodEnd)}
              </Styled.InfoValue>
            </Styled.InfoRow>
            <Styled.InfoRow>
              <Styled.InfoLabel>Начислено:</Styled.InfoLabel>
              <Styled.InfoValue>{formatCurrency(totalSalary)}</Styled.InfoValue>
            </Styled.InfoRow>
            {advancesDeducted > 0 && (
              <Styled.InfoRow>
                <Styled.InfoLabel>Авансы:</Styled.InfoLabel>
                <Styled.InfoValue>- {formatCurrency(advancesDeducted)}</Styled.InfoValue>
              </Styled.InfoRow>
            )}
            <Styled.InfoRow style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #bae6fd' }}>
              <Styled.InfoLabel style={{ fontWeight: '600' }}>К выплате:</Styled.InfoLabel>
              <Styled.InfoValue $highlight style={{ fontSize: '16px' }}>
                {formatCurrency(amountToPay)}
              </Styled.InfoValue>
            </Styled.InfoRow>
          </Styled.InfoBox>

          <Styled.FormGroup>
            <Styled.Label>Счёт для списания *</Styled.Label>
            <Styled.Select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              disabled={isLoadingAccounts || isProcessing}
            >
              <option value="">Выберите счёт</option>
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({formatCurrency(account.balance)})
                </option>
              ))}
            </Styled.Select>
          </Styled.FormGroup>
        </Styled.ModalBody>

        <Styled.ModalFooter>
          <Styled.Button $variant="secondary" onClick={onClose} disabled={isProcessing}>
            Отмена
          </Styled.Button>
          <Styled.Button onClick={handleSubmit} disabled={isProcessing || !selectedAccountId}>
            {isProcessing ? 'Выплачиваю...' : 'Выплатить'}
          </Styled.Button>
        </Styled.ModalFooter>
      </Styled.ModalContent>
    </Styled.ModalOverlay>
  )
}
