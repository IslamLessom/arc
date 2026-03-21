import { useState } from 'react'
import { useInvoices } from '../hooks/useInvoices'
import { AddAccountModal } from './add-account-modal'
import type { Account } from '@restaurant-pos/types'
import * as Styled from './styled'

export const Invoices = () => {
  const {
    allAccounts,
    accounts,
    isLoading,
    isProcessingTransaction,
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
    handleDeleteAccount,
    handleTopUpAccount,
    handleTransferBetweenAccounts,
    getAccountTypeName,
  } = useInvoices()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
  const [transactionMode, setTransactionMode] = useState<'top-up' | 'transfer' | null>(null)
  const [topUpAccountId, setTopUpAccountId] = useState('')
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [operationAmount, setOperationAmount] = useState('')
  const [operationDescription, setOperationDescription] = useState('')

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

  const resetTransactionForm = () => {
    setTransactionMode(null)
    setTopUpAccountId('')
    setFromAccountId('')
    setToAccountId('')
    setOperationAmount('')
    setOperationDescription('')
  }

  const openTopUpModal = (accountId?: string) => {
    setTransactionMode('top-up')
    setTopUpAccountId(accountId || allAccounts[0]?.id || '')
    setOperationAmount('')
    setOperationDescription('')
  }

  const openTransferModal = (sourceAccountId?: string) => {
    const fromId = sourceAccountId || allAccounts[0]?.id || ''
    const toId = allAccounts.find((account) => account.id !== fromId)?.id || ''

    setTransactionMode('transfer')
    setFromAccountId(fromId)
    setToAccountId(toId)
    setOperationAmount('')
    setOperationDescription('')
  }

  const handleTransactionSubmit = async () => {
    const normalizedAmount = Number(operationAmount.replace(',', '.'))

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      window.alert('Введите корректную сумму больше 0')
      return
    }

    try {
      if (transactionMode === 'top-up') {
        if (!topUpAccountId) {
          window.alert('Выберите счет для пополнения')
          return
        }

        await handleTopUpAccount({
          accountId: topUpAccountId,
          amount: normalizedAmount,
          description: operationDescription,
        })
        window.alert('Счет успешно пополнен')
        resetTransactionForm()
        return
      }

      if (transactionMode === 'transfer') {
        if (!fromAccountId || !toAccountId) {
          window.alert('Выберите счета отправителя и получателя')
          return
        }

        if (fromAccountId === toAccountId) {
          window.alert('Счета отправителя и получателя должны отличаться')
          return
        }

        await handleTransferBetweenAccounts({
          fromAccountId,
          toAccountId,
          amount: normalizedAmount,
          description: operationDescription,
        })
        window.alert('Перевод выполнен')
        resetTransactionForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось выполнить операцию'
      window.alert(message)
    }
  }

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance)
  }

  const selectedTopUpAccount = allAccounts.find((account) => account.id === topUpAccountId)
  const selectedFromAccount = allAccounts.find((account) => account.id === fromAccountId)

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

      {transactionMode && (
        <Styled.ConfirmationOverlay onClick={resetTransactionForm}>
          <Styled.ConfirmationModal onClick={(e) => e.stopPropagation()}>
            <Styled.ConfirmationHeader>
              <Styled.ConfirmationTitle>
                {transactionMode === 'top-up' ? 'Пополнение счета' : 'Перевод между счетами'}
              </Styled.ConfirmationTitle>
              <Styled.CloseButton onClick={resetTransactionForm}>×</Styled.CloseButton>
            </Styled.ConfirmationHeader>
            <Styled.ConfirmationBody>
              <Styled.FormGrid>
                {transactionMode === 'top-up' ? (
                  <>
                    <Styled.FormField>
                      <Styled.FormLabel>Счет</Styled.FormLabel>
                      <Styled.FormSelect
                        value={topUpAccountId}
                        onChange={(e) => setTopUpAccountId(e.target.value)}
                      >
                        <option value="">Выберите счет</option>
                        {allAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} ({account.currency})
                          </option>
                        ))}
                      </Styled.FormSelect>
                    </Styled.FormField>
                    {selectedTopUpAccount && (
                      <Styled.HintText>
                        Текущий баланс: {formatBalance(selectedTopUpAccount.balance)}{' '}
                        {selectedTopUpAccount.currency}
                      </Styled.HintText>
                    )}
                  </>
                ) : (
                  <>
                    <Styled.FormField>
                      <Styled.FormLabel>Со счета</Styled.FormLabel>
                      <Styled.FormSelect
                        value={fromAccountId}
                        onChange={(e) => {
                          const nextFromAccountId = e.target.value
                          setFromAccountId(nextFromAccountId)

                          if (nextFromAccountId === toAccountId) {
                            const nextTarget =
                              allAccounts.find((account) => account.id !== nextFromAccountId)?.id ||
                              ''
                            setToAccountId(nextTarget)
                          }
                        }}
                      >
                        <option value="">Выберите счет</option>
                        {allAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} ({account.currency})
                          </option>
                        ))}
                      </Styled.FormSelect>
                    </Styled.FormField>
                    <Styled.FormField>
                      <Styled.FormLabel>На счет</Styled.FormLabel>
                      <Styled.FormSelect
                        value={toAccountId}
                        onChange={(e) => setToAccountId(e.target.value)}
                      >
                        <option value="">Выберите счет</option>
                        {allAccounts.map((account) => (
                          <option
                            key={account.id}
                            value={account.id}
                            disabled={account.id === fromAccountId}
                          >
                            {account.name} ({account.currency})
                          </option>
                        ))}
                      </Styled.FormSelect>
                    </Styled.FormField>
                    {selectedFromAccount && (
                      <Styled.HintText>
                        Доступно для перевода: {formatBalance(selectedFromAccount.balance)}{' '}
                        {selectedFromAccount.currency}
                      </Styled.HintText>
                    )}
                  </>
                )}

                <Styled.FormField>
                  <Styled.FormLabel>Сумма</Styled.FormLabel>
                  <Styled.FormInput
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Введите сумму"
                    value={operationAmount}
                    onChange={(e) => setOperationAmount(e.target.value)}
                  />
                </Styled.FormField>

                <Styled.FormField>
                  <Styled.FormLabel>Комментарий (необязательно)</Styled.FormLabel>
                  <Styled.FormInput
                    type="text"
                    placeholder="Например: перевод для закупки"
                    value={operationDescription}
                    onChange={(e) => setOperationDescription(e.target.value)}
                  />
                </Styled.FormField>
              </Styled.FormGrid>

              <Styled.ConfirmationActions>
                <Styled.CancelButton onClick={resetTransactionForm}>Отмена</Styled.CancelButton>
                <Styled.SuccessButton onClick={handleTransactionSubmit} disabled={isProcessingTransaction}>
                  {isProcessingTransaction ? 'Сохраняем...' : 'Подтвердить'}
                </Styled.SuccessButton>
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
          <Styled.CompactActionButton onClick={() => openTopUpModal()}>
            <span>💰</span>
            Пополнить
          </Styled.CompactActionButton>
          <Styled.CompactActionButton onClick={() => openTransferModal()}>
            <span>⇄</span>
            Перевод
          </Styled.CompactActionButton>
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
                      onClick={() => openTopUpModal(account.id)}
                      title="Пополнить"
                    >
                      💰
                    </Styled.IconButton>
                    <Styled.IconButton
                      onClick={() => openTransferModal(account.id)}
                      title="Перевести на другой счет"
                    >
                      ⇄
                    </Styled.IconButton>
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
