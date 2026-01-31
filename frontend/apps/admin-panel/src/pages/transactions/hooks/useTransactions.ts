import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetTransactions } from '@restaurant-pos/api-client'
import type { Transaction } from '@restaurant-pos/types'

export const useTransactions = () => {
  const navigate = useNavigate()
  const { data: transactions = [], isLoading, refetch } = useGetTransactions()

  const handleBack = () => {
    navigate('/finance')
  }

  const refreshTransactions = useCallback(() => {
    refetch()
  }, [refetch])

  return {
    isLoading,
    transactions,
    handleBack,
    refreshTransactions
  }
}
