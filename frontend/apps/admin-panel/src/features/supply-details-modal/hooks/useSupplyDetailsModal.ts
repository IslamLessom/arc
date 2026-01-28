import { useEffect } from 'react'
import { useGetSupply } from '@restaurant-pos/api-client'
import type { SupplyDetailsModalProps, SupplyDetailsModalData } from '../model/types'

export const useSupplyDetailsModal = (props: SupplyDetailsModalProps): SupplyDetailsModalData => {
  const { isOpen, supplyId } = props

  const { data: supply, isLoading, error } = useGetSupply(supplyId)

  useEffect(() => {
    if (isOpen && !supplyId) {
      console.warn('SupplyDetailsModal opened without supplyId')
    }
  }, [isOpen, supplyId])

  return {
    supply,
    isLoading,
    error: error ? 'Ошибка при загрузке данных о поставке' : null,
  }
}
