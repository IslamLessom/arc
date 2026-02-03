import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSalaryReport, type SalaryReport, type SalaryEntry } from '@restaurant-pos/api-client'

export const useSalary = () => {
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState(() => {
    // По умолчанию - начало текущего месяца
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  })
  const [endDate, setEndDate] = useState(() => {
    // По умолчанию - текущий день
    const now = new Date()
    return now.toISOString()
  })

  const { data: report, isLoading, error } = useSalaryReport({
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

  return {
    isLoading,
    error,
    report,
    startDate,
    endDate,
    handleBack,
    handleDateChange,
  }
}
