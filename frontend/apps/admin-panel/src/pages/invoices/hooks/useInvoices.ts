import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useGetAccounts,
  useUpdateAccount,
  useDeleteAccount,
  useGetAccountTypes,
  type Account,
  type AccountType,
} from '@restaurant-pos/api-client'

export const useInvoices = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set())

  const { data: accounts = [], isLoading } = useGetAccounts()
  const { data: accountTypes = [] } = useGetAccountTypes()

  const updateAccountMutation = useUpdateAccount()
  const deleteAccountMutation = useDeleteAccount()

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

  const filteredAccounts = useMemo(() => {
    if (!searchQuery) return accounts
    const query = searchQuery.toLowerCase()
    return accounts.filter(
      (account) =>
        account.name.toLowerCase().includes(query) ||
        account.currency.toLowerCase().includes(query) ||
        account.type?.name.toLowerCase().includes(query) ||
        account.type?.displayName.toLowerCase().includes(query)
    )
  }, [accounts, searchQuery])

  const getAccountTypeName = (typeId: string) => {
    const type = accountTypes.find((t) => t.id === typeId)
    return type?.displayName || type?.name || typeId
  }

  const isAllSelected = selectedAccounts.size === filteredAccounts.length && filteredAccounts.length > 0
  const isSomeSelected = selectedAccounts.size > 0

  return {
    accounts: filteredAccounts,
    accountTypes,
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
  }
}
