import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useGetAccounts,
  useUpdateAccount,
  useDeleteAccount,
  useGetAccountTypes,
  useCreateTransaction,
  type Account,
} from '@restaurant-pos/api-client'

export const useInvoices = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set())

  const { data: allAccounts = [], isLoading } = useGetAccounts()
  const { data: accountTypes = [] } = useGetAccountTypes()

  const updateAccountMutation = useUpdateAccount()
  const deleteAccountMutation = useDeleteAccount()
  const createTransactionMutation = useCreateTransaction()

  const handleBack = () => {
    navigate('/finance')
  }

  const handleSelectAccount = (accountId: string) => {
    setSelectedAccounts((prev) => {
      const next = new Set(prev)
      if (next.has(accountId)) {
        next.delete(accountId)
      } else {
        next.add(accountId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedAccounts.size === filteredAccounts.length) {
      setSelectedAccounts(new Set())
    } else {
      setSelectedAccounts(new Set(filteredAccounts.map((a) => a.id)))
    }
  }

  const handleDeleteSelected = async () => {
    for (const accountId of selectedAccounts) {
      await deleteAccountMutation.mutateAsync(accountId)
    }
    setSelectedAccounts(new Set())
  }

  const handleToggleActive = async (account: Account) => {
    await updateAccountMutation.mutateAsync({
      id: account.id,
      data: { active: !account.active },
    })
  }

  const handleUpdateAccount = async (id: string, data: { name?: string; currency?: string; type_id?: string; initial_balance?: number }) => {
    await updateAccountMutation.mutateAsync({ id, data })
  }

  const handleDeleteAccount = async (id: string) => {
    await deleteAccountMutation.mutateAsync(id)
  }

  const handleTopUpAccount = async ({
    accountId,
    amount,
    description,
  }: {
    accountId: string
    amount: number
    description?: string
  }) => {
    await createTransactionMutation.mutateAsync({
      account_id: accountId,
      type: 'income',
      category: 'Пополнение счета',
      amount,
      description,
    })
  }

  const handleTransferBetweenAccounts = async ({
    fromAccountId,
    toAccountId,
    amount,
    description,
  }: {
    fromAccountId: string
    toAccountId: string
    amount: number
    description?: string
  }) => {
    if (fromAccountId === toAccountId) {
      throw new Error('Счета для перевода должны отличаться')
    }

    const fromAccount = allAccounts.find((account) => account.id === fromAccountId)
    if (!fromAccount) {
      throw new Error('Счет списания не найден')
    }

    if (fromAccount.balance < amount) {
      throw new Error('Недостаточно средств на счете списания')
    }

    const baseDescription = description?.trim()
    const expenseDescription = baseDescription
      ? `${baseDescription} (перевод на другой счет)`
      : 'Перевод на другой счет'
    const incomeDescription = baseDescription
      ? `${baseDescription} (перевод с другого счета)`
      : 'Перевод с другого счета'

    await createTransactionMutation.mutateAsync({
      account_id: fromAccountId,
      type: 'expense',
      category: 'Перевод между счетами',
      amount,
      description: expenseDescription,
    })

    try {
      await createTransactionMutation.mutateAsync({
        account_id: toAccountId,
        type: 'income',
        category: 'Перевод между счетами',
        amount,
        description: incomeDescription,
      })
    } catch (error) {
      // Best-effort compensation to avoid lost funds when the second transaction fails.
      await createTransactionMutation.mutateAsync({
        account_id: fromAccountId,
        type: 'income',
        category: 'Компенсация перевода',
        amount,
        description: 'Автовозврат после ошибки зачисления при переводе',
      })
      throw error
    }
  }

  const filteredAccounts = useMemo(() => {
    if (!searchQuery) return allAccounts
    const query = searchQuery.toLowerCase()
    return allAccounts.filter(
      (account) =>
        account.name.toLowerCase().includes(query) ||
        account.currency.toLowerCase().includes(query) ||
        account.type?.name.toLowerCase().includes(query) ||
        account.type?.displayName.toLowerCase().includes(query)
    )
  }, [allAccounts, searchQuery])

  const getAccountTypeName = (typeId: string) => {
    const type = accountTypes.find((t) => t.id === typeId)
    return type?.displayName || type?.name || typeId
  }

  const isAllSelected = selectedAccounts.size === filteredAccounts.length && filteredAccounts.length > 0
  const isSomeSelected = selectedAccounts.size > 0

  return {
    allAccounts,
    accounts: filteredAccounts,
    accountTypes,
    isLoading,
    isProcessingTransaction: createTransactionMutation.isPending,
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
    handleTopUpAccount,
    handleTransferBetweenAccounts,
    getAccountTypeName,
  }
}
