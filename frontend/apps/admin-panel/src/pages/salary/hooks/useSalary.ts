import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateAdvance, useSalaryReport, usePaySalary } from '@restaurant-pos/api-client'

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
  const [paymentModal, setPaymentModal] = useState<{
    employeeId: string
    employeeName: string
    totalSalary: number
    advancesDeducted: number
    amountToPay: number
  } | null>(null)

  const { data: report, isLoading, error, refetch } = useSalaryReport({
    startDate,
    endDate,
  })
  const { mutateAsync: createAdvance, isPending: isCreatingAdvance } = useCreateAdvance()
  const { mutateAsync: paySalary, isPending: isPayingSalary } = usePaySalary()

  const handleBack = () => {
    navigate('/finance')
  }

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  const handleGiveAdvance = async (employeeId: string, employeeName: string) => {
    const amountInput = window.prompt(`Сумма аванса для ${employeeName}`)
    if (!amountInput) {
      return
    }

    const amount = Number(amountInput.replace(',', '.'))
    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert('Введите корректную сумму аванса')
      return
    }

    const description = window.prompt('Комментарий к авансу (необязательно)') || undefined

    await createAdvance({
      user_id: employeeId,
      amount,
      description,
    })

    await refetch()
  }

  const handleOpenPaymentModal = (
    employeeId: string,
    employeeName: string,
    totalSalary: number,
    advancesDeducted: number,
    amountToPay: number
  ) => {
    setPaymentModal({
      employeeId,
      employeeName,
      totalSalary,
      advancesDeducted,
      amountToPay,
    })
  }

  const handleClosePaymentModal = () => {
    setPaymentModal(null)
  }

  const handleConfirmPayment = async (accountId: string) => {
    if (!paymentModal) return

    try {
      await paySalary({
        user_id: paymentModal.employeeId,
        account_id: accountId,
        period_start: startDate,
        period_end: endDate,
      })

      window.alert(
        `Зарплата успешно выплачена сотруднику ${paymentModal.employeeName}`
      )

      await refetch()
      setPaymentModal(null)
    } catch (error) {
      console.error('Ошибка при выплате зарплаты:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Не удалось выплатить зарплату'
      window.alert(`Ошибка: ${errorMessage}`)
    }
  }

  return {
    isLoading,
    error,
    report,
    isCreatingAdvance,
    isPayingSalary,
    startDate,
    endDate,
    paymentModal,
    handleBack,
    handleDateChange,
    handleGiveAdvance,
    handleOpenPaymentModal,
    handleClosePaymentModal,
    handleConfirmPayment,
  }
}

