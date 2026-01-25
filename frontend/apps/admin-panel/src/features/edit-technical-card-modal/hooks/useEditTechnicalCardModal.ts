import { useState, useEffect, useCallback } from 'react'
import type {
  EditTechnicalCardModalProps,
  EditTechnicalCardFormData,
  UseEditTechnicalCardModalResult,
} from '../model/types'

const MOCK_CARD_DATA = {
  '1': {
    name: 'Салат Цезарь',
    category: 'Салаты',
    ingredients: 8,
    weight: 250,
    cost: 120.50,
    price: 280.00,
    margin: 57.1,
    status: 'active' as const,
  },
  '2': {
    name: 'Борщ Ukrainian',
    category: 'Супы',
    ingredients: 12,
    weight: 350,
    cost: 85.00,
    price: 180.00,
    margin: 52.8,
    status: 'active' as const,
  },
  '3': {
    name: 'Карбонара',
    category: 'Паста',
    ingredients: 6,
    weight: 320,
    cost: 150.00,
    price: 350.00,
    margin: 57.1,
    status: 'inactive' as const,
  },
}

export function useEditTechnicalCardModal(
  props: EditTechnicalCardModalProps
): UseEditTechnicalCardModalResult {
  const [formData, setFormData] = useState<EditTechnicalCardFormData>({
    name: '',
    category: '',
    ingredients: 0,
    weight: 0,
    cost: 0,
    price: 0,
    margin: 0,
    status: 'active',
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (props.isOpen && props.cardId) {
      setIsLoading(true)
      // Имитация загрузки данных
      setTimeout(() => {
        const cardData = MOCK_CARD_DATA[props.cardId as keyof typeof MOCK_CARD_DATA] || {
          name: '',
          category: '',
          ingredients: 0,
          weight: 0,
          cost: 0,
          price: 0,
          margin: 0,
          status: 'active' as const,
        }
        setFormData(cardData)
        setIsLoading(false)
      }, 500)
    }
  }, [props.isOpen, props.cardId])

  const isSubmitting = false

  const handleFieldChange = useCallback(
    (field: keyof EditTechnicalCardFormData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!formData.name || !formData.category) {
        return
      }

      try {
        const updatedCard = {
          id: props.cardId,
          name: formData.name,
          category: formData.category,
          ingredients: formData.ingredients,
          weight: formData.weight,
          cost: formData.cost,
          price: formData.price,
          margin: formData.margin,
          status: formData.status,
          lastModified: new Date().toISOString().split('T')[0],
        }

        props.onSuccess?.(updatedCard)
        props.onClose()
      } catch (error) {
        console.error('Failed to update technical card:', error)
      }
    },
    [formData, props]
  )

  const handleClose = useCallback(() => {
    props.onClose()
  }, [props])

  return {
    formData,
    isLoading,
    isSubmitting,
    error: null,
    handleFieldChange,
    handleSubmit,
    handleClose,
  }
}
