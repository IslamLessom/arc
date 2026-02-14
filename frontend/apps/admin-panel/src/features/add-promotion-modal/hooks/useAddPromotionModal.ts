import { useEffect, useMemo, useState } from 'react'
import { useMarketingPromotions } from '@restaurant-pos/api-client'
import type { AddPromotionModalProps, PromotionFormData } from '../model/types'

const formatDateForInput = (value?: string) => {
  if (!value) return ''
  return value.slice(0, 10)
}

const defaultForm: PromotionFormData = {
  name: '',
  description: '',
  type: 'discount',
  discount_percentage: '',
  buy_quantity: '',
  get_quantity: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
  active: true,
}

export const useAddPromotionModal = (props: AddPromotionModalProps) => {
  const { promotions, createPromotion, updatePromotion } = useMarketingPromotions()

  const [formData, setFormData] = useState<PromotionFormData>(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!props.isOpen) return

    if (props.promotionId) {
      const current = promotions.find((p) => p.id === props.promotionId)
      if (!current) return

      setFormData({
        name: current.name || '',
        description: current.description || '',
        type: current.type,
        discount_percentage: current.discount_percentage?.toString() || '',
        buy_quantity: current.buy_quantity?.toString() || '',
        get_quantity: current.get_quantity?.toString() || '',
        start_date: formatDateForInput(current.start_date),
        end_date: formatDateForInput(current.end_date),
        active: current.active,
      })
      return
    }

    setFormData(defaultForm)
  }, [props.isOpen, props.promotionId, promotions])

  const handleFieldChange = (field: keyof PromotionFormData, value: string | boolean) => {
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
    if (!formData.start_date) errors.start_date = 'Дата начала обязательна'
    if (!formData.end_date) errors.end_date = 'Дата окончания обязательна'

    if ((formData.type === 'discount' || formData.type === 'happy_hour') && formData.discount_percentage) {
      const discount = Number(formData.discount_percentage)
      if (Number.isNaN(discount) || discount < 0 || discount > 100) {
        errors.discount_percentage = 'Скидка должна быть от 0 до 100'
      }
    }

    if (formData.type === 'buy_x_get_y') {
      const buy = Number(formData.buy_quantity)
      const get = Number(formData.get_quantity)
      if (!formData.buy_quantity || Number.isNaN(buy) || buy <= 0) {
        errors.buy_quantity = 'Укажите корректное количество X'
      }
      if (!formData.get_quantity || Number.isNaN(get) || get <= 0) {
        errors.get_quantity = 'Укажите корректное количество Y'
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
        discount_percentage:
          formData.type === 'discount' || formData.type === 'happy_hour'
            ? (formData.discount_percentage ? Number(formData.discount_percentage) : undefined)
            : undefined,
        buy_quantity: formData.type === 'buy_x_get_y' ? Number(formData.buy_quantity) : undefined,
        get_quantity: formData.type === 'buy_x_get_y' ? Number(formData.get_quantity) : undefined,
        start_date: formData.start_date,
        end_date: formData.end_date,
      }

      if (props.promotionId) {
        await updatePromotion(props.promotionId, {
          ...basePayload,
          active: formData.active,
        })
      } else {
        await createPromotion(basePayload)
      }

      props.onSuccess?.()
      props.onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении акции')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = useMemo(() => {
    return Boolean(formData.name.trim() && formData.start_date && formData.end_date)
  }, [formData])

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
