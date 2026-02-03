import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActiveOrdersFormatted } from '@restaurant-pos/api-client'
import { HomePageProps } from '../model/types'

export interface UseHomePageResult {
  handleNewOrderClick: () => void
  activeOrders: ReturnType<typeof useActiveOrdersFormatted>
}

export const useHomePage = (props?: HomePageProps): UseHomePageResult => {
  const navigate = useNavigate()
  const activeOrders = useActiveOrdersFormatted()

  const handleNewOrderClick = useCallback(() => {
    navigate('/table-selection')
  }, [navigate])

  return {
    handleNewOrderClick,
    activeOrders,
  }
}

