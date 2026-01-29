import { useEffect, useState, useCallback } from 'react'
import { useGetSupply, useUpdateSupply, type CreateSupplyRequest } from '@restaurant-pos/api-client'
import type { SupplyDetailsModalProps, SupplyDetailsModalData } from '../model/types'

export const useSupplyDetailsModal = (props: SupplyDetailsModalProps): SupplyDetailsModalData => {
  const { isOpen, supplyId, mode: initialMode = 'view' } = props
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode)

  const { data: supply, isLoading, error } = useGetSupply(supplyId)
  const updateSupply = useUpdateSupply()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && !supplyId) {
      console.warn('SupplyDetailsModal opened without supplyId')
    }
  }, [isOpen, supplyId])

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

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
          items: supplyToUpdate.items?.map(item => ({
            ingredient_id: item.ingredient_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit: item.unit,
            price_per_unit: item.price_per_unit,
            total_amount: item.total_amount,
          })) || [],
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

  const onToggleStatus = useCallback(async () => {
    if (!supply) return

    const newStatus: 'pending' | 'completed' | 'cancelled' =
      supply.status === 'pending' ? 'completed' :
      supply.status === 'completed' ? 'pending' :
      'pending'

    setIsSaving(true)
    try {
      await updateSupply.mutateAsync({
        id: supply.id,
        data: {
          warehouse_id: supply.warehouse_id,
          supplier_id: supply.supplier_id,
          delivery_date_time: supply.delivery_date_time,
          status: newStatus,
          comment: supply.comment,
          items: supply.items?.map(item => ({
            ingredient_id: item.ingredient_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit: item.unit,
            price_per_unit: item.price_per_unit,
            total_amount: item.total_amount,
          })) || [],
        },
      })
    } catch (err) {
      console.error('Failed to update supply status:', err)
    } finally {
      setIsSaving(false)
    }
  }, [supply, updateSupply])

  return {
    supply,
    isLoading,
    error: error ? 'Ошибка при загрузке данных о поставке' : null,
    isSaving,
    mode,
    setMode,
    onSave,
    onCancel,
    onToggleStatus,
  }
}
