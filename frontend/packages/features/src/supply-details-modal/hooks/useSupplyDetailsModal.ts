import { useEffect, useState, useCallback } from 'react'
import { useGetAccounts, useGetSupply, useUpdateSupply, type Supply } from '@restaurant-pos/api-client'
import type { SupplyDetailsModalProps, SupplyDetailsModalData } from '../model/types'

const mapSupplyItems = (supply: Supply) => supply.items?.map(item => ({
  ingredient_id: item.ingredient_id,
  product_id: item.product_id,
  quantity: item.quantity,
  unit: item.unit,
  price_per_unit: item.price_per_unit,
  total_amount: item.total_amount,
})) || []

const getTotalAmount = (supply?: Supply) => supply?.items?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0
const getPaidAmount = (supply?: Supply) => supply?.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

export const useSupplyDetailsModal = (props: SupplyDetailsModalProps): SupplyDetailsModalData => {
  const { isOpen, supplyId, mode: initialMode = 'view' } = props
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const { data: supply, isLoading, error } = useGetSupply(supplyId)
  const { data: accounts = [] } = useGetAccounts(undefined, true)
  const updateSupply = useUpdateSupply()
  const [isSaving, setIsSaving] = useState(false)
  const remainingDebt = Math.max(getTotalAmount(supply) - getPaidAmount(supply), 0)

  useEffect(() => {
    if (isOpen && !supplyId) {
      console.warn('SupplyDetailsModal opened without supplyId')
    }
  }, [isOpen, supplyId])

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  useEffect(() => {
    if (isOpen) {
      setPaymentError(null)
    }
  }, [isOpen, supplyId])

  const onSave = useCallback(async (editedSupply?: Supply) => {
    const supplyToUpdate = editedSupply || supply
    if (!supplyToUpdate) return

    setIsSaving(true)
    try {
      await updateSupply.mutateAsync({
        id: supplyToUpdate.id,
        data: {
          warehouse_id: supplyToUpdate.warehouse_id,
          supplier_id: supplyToUpdate.supplier_id,
          delivery_date_time: supplyToUpdate.delivery_date_time,
          status: supplyToUpdate.status,
          comment: supplyToUpdate.comment,
          items: mapSupplyItems(supplyToUpdate),
        },
      })
      setMode('view')
    } catch (err) {
      console.error('Failed to update supply:', err)
    } finally {
      setIsSaving(false)
    }
  }, [supply, updateSupply])

  const onCancel = useCallback(() => {
    setMode('view')
  }, [])

  const clearPaymentError = useCallback(() => {
    setPaymentError(null)
  }, [])

  const onMarkAsPaid = useCallback(async (accountId: string) => {
    if (!supply) return
    if (!accountId) {
      setPaymentError('Выберите счет для оплаты')
      return
    }

    if (remainingDebt <= 0) {
      setPaymentError('По поставке нет задолженности')
      return
    }

    const selectedAccount = accounts.find(account => account.id === accountId)
    if (!selectedAccount) {
      setPaymentError('Выбранный счет не найден')
      return
    }

    if (selectedAccount.balance < remainingDebt) {
      setPaymentError('Недостаточно средств на выбранном счете')
      return
    }

    setIsSaving(true)
    setPaymentError(null)
    try {
      await updateSupply.mutateAsync({
        id: supply.id,
        data: {
          warehouse_id: supply.warehouse_id,
          supplier_id: supply.supplier_id,
          delivery_date_time: supply.delivery_date_time,
          status: supply.status,
          payment_status: 'paid',
          comment: supply.comment,
          items: mapSupplyItems(supply),
          payments: [
            {
              account_id: accountId,
              amount: remainingDebt,
              payment_date_time: new Date().toISOString(),
            },
          ],
        },
      })
    } catch (err) {
      console.error('Failed to update supply status:', err)
      setPaymentError('Не удалось провести оплату поставки')
    } finally {
      setIsSaving(false)
    }
  }, [supply, updateSupply, remainingDebt, accounts])

  return {
    supply,
    accounts,
    remainingDebt,
    isLoading,
    error: error ? 'Ошибка при загрузке данных о поставке' : null,
    paymentError,
    isSaving,
    mode,
    setMode,
    onSave,
    onCancel,
    clearPaymentError,
    onMarkAsPaid,
  }
}
