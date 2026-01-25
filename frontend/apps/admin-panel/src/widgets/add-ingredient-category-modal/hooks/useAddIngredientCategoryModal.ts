import { useState, useCallback } from 'react'
import { useCreateIngredientCategory } from '@restaurant-pos/api-client'
import type {
  AddIngredientCategoryModalProps,
  AddIngredientCategoryFormData,
  UseAddIngredientCategoryModalResult,
} from '../model/types'

export function useAddIngredientCategoryModal(
  props: AddIngredientCategoryModalProps
): UseAddIngredientCategoryModalResult {
  const [formData, setFormData] = useState<AddIngredientCategoryFormData>({
    name: '',
  })

  const [error, setError] = useState<string | null>(null)

  const { mutateAsync: createCategory, isPending: isSubmitting } =
    useCreateIngredientCategory()

  const handleFieldChange = useCallback(
    (field: keyof AddIngredientCategoryFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setError(null)
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      if (!formData.name.trim()) {
        setError('Название категории обязательно')
        return
      }

      try {
        await createCategory({
          name: formData.name.trim(),
        })
        props.onSuccess?.()
        props.onClose()

        // Reset form
        setFormData({
          name: '',
        })
        setError(null)
      } catch (err) {
        console.error('Failed to create ingredient category:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Не удалось создать категорию. Попробуйте еще раз.'
        )
      }
    },
    [formData, createCategory, props]
  )

  const handleClose = useCallback(() => {
    props.onClose()
    setFormData({
      name: '',
    })
    setError(null)
  }, [props])

  return {
    formData,
    isLoading: false,
    isSubmitting,
    error,
    handleFieldChange,
    handleSubmit,
    handleClose,
  }
}