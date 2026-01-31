import { useState } from 'react'
import { useInvoices } from '../hooks/useInvoices'
import { AddAccountModal } from './add-account-modal'
import type { Account } from '@restaurant-pos/types'
import * as Styled from './styled'

export const Invoices = () => {
  const {
    accounts,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedAccounts,
    isAllSelected,
    isSomeSelected,
    handleBack,
    handleSelectAccount,
    handleSelectAll,
    handleDeleteSelected,
    handleToggleActive,
    handleUpdateAccount,
    handleDeleteAccount,
    getAccountTypeName,
  } = useInvoices()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)

  const handleOpenAddModal = () => setIsAddModalOpen(true)
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
    setEditingAccount(null)
  }
  const handleAddSuccess = () => {
    setIsAddModalOpen(false)
    setEditingAccount(null)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setIsAddModalOpen(true)
  }

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account)
  }

  const confirmDelete = () => {
    if (accountToDelete) {
      handleDeleteAccount(accountToDelete.id)
      setAccountToDelete(null)
    }
  }

  const handleDeleteSelectedClick = () => {
    if (selectedAccounts.size > 0 && confirm(`Удалить ${selectedAccounts.size} выбранных счетов?`)) {
      handleDeleteSelected()
    }
  }

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance)
  }

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка счетов...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleAddSuccess}
        editingAccount={editingAccount}
      />

      {/* Delete confirmation modal */}
      {accountToDelete && (
        <Styled.ConfirmationOverlay onClick={() => setAccountToDelete(null)}>
          <Styled.ConfirmationModal onClick={(e) => e.stopPropagation()}>
            <Styled.ConfirmationHeader>
              <Styled.ConfirmationTitle>Подтверждение удаления</Styled.ConfirmationTitle>
              <Styled.CloseButton onClick={() => setAccountToDelete(null)}>×</Styled.CloseButton>
            </Styled.ConfirmationHeader>
            <Styled.ConfirmationBody>
              <Styled.ConfirmationMessage>
                Вы уверены, что хотите удалить счет <strong>"{accountToDelete.name}"</strong>?
              </Styled.ConfirmationMessage>
              <Styled.ConfirmationWarning>
                Это действие нельзя отменить.
              </Styled.ConfirmationWarning>
              <Styled.ConfirmationActions>
                <Styled.CancelButton onClick={() => setAccountToDelete(null)}>
                  Отмена
                </Styled.CancelButton>
                <Styled.DeleteConfirmButton onClick={confirmDelete}>
                  Удалить
                </Styled.DeleteConfirmButton>
              </Styled.ConfirmationActions>
            </Styled.ConfirmationBody>
          </Styled.ConfirmationModal>
        </Styled.ConfirmationOverlay>
      )}

      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Счета</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderActions>
          {isSomeSelected && (
            <Styled.ActionButton onClick={handleDeleteSelectedClick}>
              <span>🗑️</span>
              Удалить выбранные
            </Styled.ActionButton>
          )}
          <Styled.ActionButton>
            <span>📋</span>
            Столбцы
          </Styled.ActionButton>
          <Styled.ActionButton>
            <span>📤</span>
            Экспорт
          </Styled.ActionButton>
          <Styled.ActionButton>
            <span>🖨️</span>
            Печать
          </Styled.ActionButton>
          <Styled.AddButton onClick={handleOpenAddModal}>
            Добавить
          </Styled.AddButton>
        </Styled.HeaderActions>
      </Styled.Header>

      <Styled.SearchContainer>
        <Styled.SearchInputWrapper>
          <Styled.SearchIcon>🔍</Styled.SearchIcon>
          <Styled.SearchInput
            placeholder="Быстрый поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Styled.SearchInputWrapper>
        <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
      </Styled.SearchContainer>

      <Styled.TableContainer>
        {accounts.length === 0 ? (
          <Styled.EmptyState>
            <Styled.EmptyIcon>📄</Styled.EmptyIcon>
            <Styled.EmptyText>Счета не найдены</Styled.EmptyText>
            <Styled.EmptySubtext>
              {searchQuery
                ? 'Попробуйте изменить параметры поиска'
                : 'Нажмите "Добавить" для создания первого счёта'}
            </Styled.EmptySubtext>
          </Styled.EmptyState>
        ) : (
          <Styled.Table>
            <Styled.TableHead>
              <tr>
                <Styled.TableHeaderCell>
                  <Styled.Checkbox
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </Styled.TableHeaderCell>
                <Styled.TableHeaderCell>Название</Styled.TableHeaderCell>
                <Styled.TableHeaderCell>Тип</Styled.TableHeaderCell>
                <Styled.TableHeaderCell>Баланс</Styled.TableHeaderCell>
                <Styled.TableHeaderCell>Валюта</Styled.TableHeaderCell>
                <Styled.TableHeaderCell>Статус</Styled.TableHeaderCell>
                <Styled.TableHeaderCell />
              </tr>
            </Styled.TableHead>
            <Styled.TableBody>
              {accounts.map((account) => (
                <Styled.TableRow key={account.id} $inactive={!account.active}>
                  <Styled.CheckboxCell>
                    <Styled.Checkbox
                      type="checkbox"
                      checked={selectedAccounts.has(account.id)}
                      onChange={() => handleSelectAccount(account.id)}
                    />
                  </Styled.CheckboxCell>
                  <Styled.TableCell>
                    <Styled.AccountName>{account.name}</Styled.AccountName>
                  </Styled.TableCell>
                  <Styled.TableCell>
                    <Styled.AccountType>
                      {getAccountTypeName(account.typeId)}
                    </Styled.AccountType>
                  </Styled.TableCell>
                  <Styled.TableCell>
                    <Styled.Balance $positive={account.balance >= 0}>
                      {formatBalance(account.balance)}
                    </Styled.Balance>
                  </Styled.TableCell>
                  <Styled.TableCell>{account.currency}</Styled.TableCell>
                  <Styled.TableCell>
                    <Styled.StatusBadge $active={account.active}>
                      {account.active ? 'Активен' : 'Неактивен'}
                    </Styled.StatusBadge>
                  </Styled.TableCell>
                  <Styled.ActionCell>
                    <Styled.IconButton
                      onClick={() => handleToggleActive(account)}
                      title={account.active ? 'Деактивировать' : 'Активировать'}
                    >
                      {account.active ? '⏸️' : '▶️'}
                    </Styled.IconButton>
                    <Styled.IconButton
                      onClick={() => handleEdit(account)}
                      title="Редактировать"
                    >
                      ✏️
                    </Styled.IconButton>
                    <Styled.DeleteButton
                      onClick={() => handleDeleteClick(account)}
                      title="Удалить"
                    >
                      🗑️
                    </Styled.DeleteButton>
                  </Styled.ActionCell>
                </Styled.TableRow>
              ))}
            </Styled.TableBody>
          </Styled.Table>
        )}
      </Styled.TableContainer>
    </Styled.PageContainer>
  )
}
