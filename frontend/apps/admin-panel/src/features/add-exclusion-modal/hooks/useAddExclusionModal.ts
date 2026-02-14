import { useEffect, useMemo, useState } from 'react'
import { useMarketingExclusions } from '@restaurant-pos/api-client'
import type { AddExclusionModalProps, ExclusionFormData } from '../model/types'

const defaultForm: ExclusionFormData = {
  name: '',
  description: '',
  type: 'category',
  entity_id: '',
  entity_name: '',
  active: true,
}

const isValidUuid = (value: string) => {
  if (!value) return true
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export const useAddExclusionModal = (props: AddExclusionModalProps) => {
  const { exclusions, createExclusion, updateExclusion } = useMarketingExclusions()

  const [formData, setFormData] = useState<ExclusionFormData>(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!props.isOpen) return

    if (props.exclusionId) {
      const current = exclusions.find((item) => item.id === props.exclusionId)
      if (!current) return

      setFormData({
        name: current.name || '',
        description: current.description || '',
        type: current.type,
        entity_id: current.entity_id || '',
        entity_name: current.entity_name || '',
        active: current.active,
      })
      return
    }

    setFormData(defaultForm)
  }, [props.isOpen, props.exclusionId, exclusions])

  const handleFieldChange = (field: keyof ExclusionFormData, value: string | boolean) => {
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
    if (!isValidUuid(formData.entity_id.trim())) errors.entity_id = 'ID должен быть UUID'

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
        entity_id: formData.entity_id.trim() || undefined,
        entity_name: formData.entity_name.trim() || undefined,
      }

      if (props.exclusionId) {
        await updateExclusion(props.exclusionId, {
          ...basePayload,
          active: formData.active,
        })
      } else {
        await createExclusion(basePayload)
      }

      props.onSuccess?.()
      props.onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении исключения')
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
