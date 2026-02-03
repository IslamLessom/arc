import type { Account } from '@restaurant-pos/types'
import * as Styled from './styled'

interface AccountFilterProps {
  accounts: Account[]
  selectedAccountIds: string[]
  onAccountToggle: (accountId: string) => void
}

export const AccountFilter = ({ accounts, selectedAccountIds, onAccountToggle }: AccountFilterProps) => {
  if (accounts.length === 0) return null

  const allSelected = selectedAccountIds.length === 0
  const selectedCount = selectedAccountIds.length

  const handleToggleAll = () => {
    if (allSelected) {
      // Select all
      accounts.forEach(account => {
        if (!selectedAccountIds.includes(account.id)) {
          onAccountToggle(account.id)
        }
      })
    } else {
      // Deselect all - currently handled by individual toggles
      // This would need to be handled differently in a real scenario
    }
  }

  return (
    <Styled.FiltersContainer>
      <Styled.FilterLabel>Счета:</Styled.FilterLabel>
      <Styled.AccountFilterButton
        $selected={allSelected}
        onClick={handleToggleAll}
      >
        {allSelected ? 'Все счета' : `Выбрано: ${selectedCount}`}
      </Styled.AccountFilterButton>
      {accounts.map(account => (
        <Styled.AccountFilterButton
          key={account.id}
          $selected={selectedAccountIds.includes(account.id) || allSelected}
          onClick={() => onAccountToggle(account.id)}
        >
          {account.name}
        </Styled.AccountFilterButton>
      ))}
    </Styled.FiltersContainer>
  )
}
