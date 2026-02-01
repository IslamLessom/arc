import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { HomePageProps } from '../model/types'

export interface UseHomePageResult {
  handleNewOrderClick: () => void
}

export const useHomePage = (props?: HomePageProps): UseHomePageResult => {
  const navigate = useNavigate()

  const handleNewOrderClick = useCallback(() => {
    navigate('/table-selection')
  }, [navigate])

  return {
    handleNewOrderClick,
  }
}

