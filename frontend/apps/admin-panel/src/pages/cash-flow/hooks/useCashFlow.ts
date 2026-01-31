import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const useCashFlow = () => {
  const navigate = useNavigate()
  const [isLoading] = useState(false)

  const handleBack = () => {
    navigate('/finance')
  }

  return {
    isLoading,
    handleBack
  }
}
