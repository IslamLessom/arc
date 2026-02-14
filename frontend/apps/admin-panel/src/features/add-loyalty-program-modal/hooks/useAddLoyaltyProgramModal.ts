import { useEffect, useMemo, useState } from 'react'
import { useMarketingLoyaltyPrograms } from '@restaurant-pos/api-client'
import type { AddLoyaltyProgramModalProps, LoyaltyProgramFormData } from '../model/types'

const defaultForm: LoyaltyProgramFormData = {
  name: '',
  description: '',
  type: 'points',
  points_per_currency: '1',
  cashback_percentage: '',
  max_cashback_amount: '',
  point_multiplier: '1',
  active: true,
}

export const useAddLoyaltyProgramModal = (props: AddLoyaltyProgramModalProps) => {
  const { loyaltyPrograms, createLoyaltyProgram, updateLoyaltyProgram } = useMarketingLoyaltyPrograms()

  const [formData, setFormData] = useState<LoyaltyProgramFormData>(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!props.isOpen) return

    if (props.programId) {
      const current = loyaltyPrograms.find((p) => p.id === props.programId)
      if (!current) return

      setFormData({
        name: current.name || '',
        description: current.description || '',
        type: current.type,
        points_per_currency: current.points_per_currency?.toString() || '',
        cashback_percentage: current.cashback_percentage?.toString() || '',
        max_cashback_amount: current.max_cashback_amount?.toString() || '',
        point_multiplier: current.point_multiplier?.toString() || '1',
        active: current.active,
      })
      return
    }

    setFormData(defaultForm)
  }, [props.isOpen, props.programId, loyaltyPrograms])

  const handleFieldChange = (field: keyof LoyaltyProgramFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = 'Название обязательно'

    const multiplier = Number(formData.point_multiplier)
    if (Number.isNaN(multiplier) || multiplier < 0.1 || multiplier > 10) {
      errors.point_multiplier = 'Мультипликатор должен быть от 0.1 до 10'
    }

    if (formData.type === 'points') {
      const points = Number(formData.points_per_currency)
      if (Number.isNaN(points) || points < 1) {
        errors.points_per_currency = 'Укажите значение от 1'
      }
    }

    if (formData.type === 'cashback') {
      const cashback = Number(formData.cashback_percentage)
      if (Number.isNaN(cashback) || cashback < 0 || cashback > 100) {
        errors.cashback_percentage = 'Кэшбэк должен быть от 0 до 100'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const basePayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        points_per_currency: formData.type === 'points' ? Number(formData.points_per_currency) : undefined,
        cashback_percentage: formData.type === 'cashback' ? Number(formData.cashback_percentage) : undefined,
        max_cashback_amount: formData.type === 'cashback' && formData.max_cashback_amount
          ? Number(formData.max_cashback_amount)
          : undefined,
        point_multiplier: Number(formData.point_multiplier),
      }

      if (props.programId) {
        await updateLoyaltyProgram(props.programId, {
          ...basePayload,
          active: formData.active,
        })
      } else {
        await createLoyaltyProgram(basePayload)
      }

      props.onSuccess?.()
      props.onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении программы')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = useMemo(() => Boolean(formData.name.trim()), [formData])

  return {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    handleFieldChange,
    handleSubmit,
    handleClose: props.onClose,
  }
}
