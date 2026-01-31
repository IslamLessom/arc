import { useState, useCallback } from 'react'
import { useGetAccounts, useCreateTransaction } from '@restaurant-pos/api-client'
import type {
  AddTransactionModalProps,
  AddTransactionFormData,
  UseAddTransactionModalResult,
} from '../model/types'
import { TransactionType } from '../model/enums'
import { getTransactionCategories } from '../lib/getTransactionCategories'

const DEFAULT_FORM_DATA: AddTransactionFormData = {
  type: TransactionType.EXPENSE,
  amount: '',
  fromAccountId: '',
  toAccountId: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  comment: '',
}

export function useAddTransactionModal(
  props: AddTransactionModalProps
): UseAddTransactionModalResult {
  const { data: accounts = [] } = useGetAccounts()
  const createTransactionMutation = useCreateTransaction()
  const categories = getTransactionCategories()

  const [formData, setFormData] = useState<AddTransactionFormData>(DEFAULT_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFieldChange = useCallback(
    <K extends keyof AddTransactionFormData>(field: K, value: AddTransactionFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setError(null)
    },
    []
  )

  const handleTypeChange = useCallback((type: TransactionType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      // Reset category when type changes
      category: '',
      // Clear toAccountId for non-transfer types
      toAccountId: type === TransactionType.TRANSFER ? prev.toAccountId : '',
    }))
    setError(null)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Validation
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError('Введите сумму больше нуля')
        return
      }

      if (!formData.fromAccountId) {
        setError('Выберите счет')
        return
      }

      if (formData.type === TransactionType.TRANSFER && !formData.toAccountId) {
        setError('Выберите счет для зачисления')
        return
      }

      if (formData.type === TransactionType.TRANSFER && formData.fromAccountId === formData.toAccountId) {
        setError('Выберите разные счета для перевода')
        return
      }

      if (formData.type !== TransactionType.TRANSFER && !formData.category) {
        setError('Выберите категорию')
        return
      }

      setIsSubmitting(true)
      setError(null)

      try {
        const amount = parseFloat(formData.amount)
        const transactionDate = new Date(`${formData.date}T${formData.time}`)

        // For transfer, we need to create two transactions
        if (formData.type === TransactionType.TRANSFER) {
          // Expense from source account
          await createTransactionMutation.mutateAsync({
            account_id: formData.fromAccountId,
            type: 'expense',
            category: 'Перевод между счетами',
            amount: amount,
            description: formData.comment || `Перевод со счета ${formData.fromAccountId}`,
            transaction_date: transactionDate.toISOString(),
          })

          // Income to destination account
          await createTransactionMutation.mutateAsync({
            account_id: formData.toAccountId!,
            type: 'income',
            category: 'Перевод между счетами',
            amount: amount,
            description: formData.comment || `Перевод на счет ${formData.toAccountId}`,
            transaction_date: transactionDate.toISOString(),
          })
        } else {
          // Single transaction for income or expense
          await createTransactionMutation.mutateAsync({
            account_id: formData.fromAccountId,
            type: formData.type,
            category: formData.category,
            amount: amount,
            description: formData.comment || undefined,
            transaction_date: transactionDate.toISOString(),
          })
        }

        props.onSuccess?.()
        props.onClose()

        // Reset form
        setFormData({
          ...DEFAULT_FORM_DATA,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
        })
      } catch (err) {
        setError('Ошибка при создании транзакции')
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, props, createTransactionMutation]
  )

  const handleClose = useCallback(() => {
    props.onClose()
    setFormData({
      ...DEFAULT_FORM_DATA,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
    })
    setError(null)
  }, [props])

  return {
    formData,
    isSubmitting,
    error,
    accounts,
    categories,
    handleFieldChange,
    handleTypeChange,
    handleSubmit,
    handleClose,
  }
}
