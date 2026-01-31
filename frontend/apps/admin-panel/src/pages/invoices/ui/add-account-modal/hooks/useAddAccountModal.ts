import { useState, useCallback, useEffect } from 'react'
import { useCreateAccount, useUpdateAccount, useGetAccountTypes } from '@restaurant-pos/api-client'
import type {
  AddAccountModalProps,
  AddAccountFormData,
  UseAddAccountModalResult,
} from '../model/types'

const DEFAULT_FORM_DATA: AddAccountFormData = {
  name: '',
  currency: 'RUB',
  typeId: '',
  balance: 0,
}

export function useAddAccountModal(
  props: AddAccountModalProps
): UseAddAccountModalResult {
  const { data: accountTypes = [] } = useGetAccountTypes()
  const createAccountMutation = useCreateAccount()
  const updateAccountMutation = useUpdateAccount()

  const [formData, setFormData] = useState<AddAccountFormData>(DEFAULT_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form when editing account changes
  useEffect(() => {
    if (props.editingAccount) {
      console.log('Editing account:', props.editingAccount)
      setFormData({
        name: props.editingAccount.name,
        currency: props.editingAccount.currency,
        typeId: props.editingAccount.typeId,
        balance: props.editingAccount.balance,
      })
    } else {
      // Set default typeId from first available type
      const defaultType = accountTypes.find((t) => t.name === 'наличные') || accountTypes[0]
      setFormData({
        ...DEFAULT_FORM_DATA,
        typeId: defaultType?.id || '',
      })
    }
  }, [props.editingAccount, accountTypes])

  const handleFieldChange = useCallback(
    (field: keyof AddAccountFormData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setError(null)
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!formData.name || !formData.typeId) {
        setError('Заполните обязательные поля')
        return
      }

      if (formData.balance < 0) {
        setError('Баланс не может быть отрицательным')
        return
      }

      setIsSubmitting(true)
      setError(null)

      try {
        if (props.editingAccount) {
          await updateAccountMutation.mutateAsync({
            id: props.editingAccount.id,
            data: {
              name: formData.name,
              currency: formData.currency,
              typeId: formData.typeId,
            },
          })
        } else {
          await createAccountMutation.mutateAsync({
            name: formData.name,
            currency: formData.currency,
            typeId: formData.typeId,
            balance: formData.balance,
          })
        }

        props.onSuccess?.()
        props.onClose()

        // Reset form
        const defaultType = accountTypes.find((t) => t.name === 'наличные') || accountTypes[0]
        setFormData({
          ...DEFAULT_FORM_DATA,
          typeId: defaultType?.id || '',
        })
      } catch (err) {
        setError(props.editingAccount ? 'Ошибка при обновлении счета' : 'Ошибка при создании счета')
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, props, accountTypes, createAccountMutation, updateAccountMutation]
  )

  const handleClose = useCallback(() => {
    props.onClose()
    const defaultType = accountTypes.find((t) => t.name === 'наличные') || accountTypes[0]
    setFormData({
      ...DEFAULT_FORM_DATA,
      typeId: defaultType?.id || '',
    })
    setError(null)
  }, [props, accountTypes])

  return {
    formData,
    isSubmitting,
    error,
    handleFieldChange,
    handleSubmit,
    handleClose,
  }
}
