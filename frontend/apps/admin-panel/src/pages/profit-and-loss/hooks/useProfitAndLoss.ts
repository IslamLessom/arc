import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfitAndLossReport } from '@restaurant-pos/api-client'
import type { ProfitAndLossReport } from '@restaurant-pos/types'

export const useProfitAndLoss = () => {
  const navigate = useNavigate()

  // Default to current month
  const [startDate, setStartDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  })
  const [endDate, setEndDate] = useState(() => {
    const now = new Date()
    return now.toISOString()
  })

  const { data: report, isLoading, error } = useProfitAndLossReport({
    startDate,
    endDate,
  })

  const handleBack = () => {
    navigate('/finance')
  }

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  const handleExport = () => {
    console.log('Export clicked')
    // TODO: Implement export
  }

  const handlePrint = () => {
    console.log('Print clicked')
    // TODO: Implement print
  }

  return {
    isLoading,
    error,
    report,
    startDate,
    endDate,
    handleBack,
    handleDateChange,
    handleExport,
    handlePrint,
  }
}
