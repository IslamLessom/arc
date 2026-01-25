import { useState, useCallback, useEffect } from 'react'
import { useCreateCategory, useUpdateCategory, useGetCategories } from '@restaurant-pos/api-client'
import type {
  AddCategoryModalProps,
  AddCategoryFormData,
  UseAddCategoryModalResult,
} from '../model/types'
import { CategoryType } from '../model/enums'

export function useAddCategoryModal(
  props: AddCategoryModalProps
): UseAddCategoryModalResult {
  const isEditMode = !!props.categoryToEdit
  
  const [formData, setFormData] = useState<AddCategoryFormData>({
    name: '',
    type: CategoryType.Product,
  })

  // Initialize form data when editing
  useEffect(() => {
    if (props.categoryToEdit) {
      setFormData({
        name: props.categoryToEdit.name,
        type: props.categoryToEdit.type,
        techCardCategory: props.categoryToEdit.parent_category_id || undefined,
      })
    } else {
      setFormData({
        name: '',
        type: CategoryType.Product,
      })
    }
  }, [props.categoryToEdit])

  const [error, setError] = useState<string | null>(null)

  const { mutateAsync: createCategory, isPending: isSubmittingCreate } =
    useCreateCategory()
  const { mutateAsync: updateCategory, isPending: isSubmittingUpdate } =
    useUpdateCategory()

  const isSubmitting = isSubmittingCreate || isSubmittingUpdate

  const {
    data: techCardCategories = [],
    isLoading: techCardCategoriesLoading,
  } = useGetCategories({ type: 'tech_card' })

  const handleFieldChange = useCallback(
    (field: keyof AddCategoryFormData, value: string) => {
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

      if (!formData.type) {
        setError('Тип категории обязателен')
        return
      }

      try {
        if (isEditMode && props.categoryToEdit) {
          await updateCategory({
            id: props.categoryToEdit.id,
            data: {
              name: formData.name.trim(),
              type: formData.type,
            }
          })
        } else {
          await createCategory({
            name: formData.name.trim(),
            type: formData.type,
            parent_category_id: formData.techCardCategory || undefined,
          })
        }
        props.onSuccess?.()
        props.onClose()

        // Reset form
        setFormData({
          name: '',
          type: CategoryType.Product,
        })
        setError(null)
      } catch (err) {
        console.error(`Failed to ${isEditMode ? 'update' : 'create'} category:`, err)
        setError(
          err instanceof Error
            ? err.message
            : `Не удалось ${isEditMode ? 'обновить' : 'создать'} категорию. Попробуйте еще раз.`
        )
      }
    },
    [formData, createCategory, props]
  )

  const handleClose = useCallback(() => {
    props.onClose()
    // Reset form only if not in edit mode
    if (!isEditMode) {
      setFormData({
        name: '',
        type: CategoryType.Product,
      })
      setError(null)
    }
  }, [props, isEditMode])

  return {
    formData,
    techCardCategories,
    techCardCategoriesLoading,
    isLoading: false,
    isSubmitting,
    error,
    handleFieldChange,
    handleSubmit,
    handleClose,
  }
}

