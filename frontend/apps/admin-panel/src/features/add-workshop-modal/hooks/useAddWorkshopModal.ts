import { useState, useEffect, useCallback } from 'react'
import {
  useGetWorkshop,
  useCreateWorkshop,
  useUpdateWorkshop,
} from '@restaurant-pos/api-client'
import type {
  AddWorkshopModalProps,
  AddWorkshopFormData,
  UseAddWorkshopModalResult,
} from '../model/types'

export function useAddWorkshopModal(
  props: AddWorkshopModalProps
): UseAddWorkshopModalResult {
  const [formData, setFormData] = useState<AddWorkshopFormData>({
    name: '',
    print_slips: false,
  })

  const [error, setError] = useState<string | null>(null)

  const { data: existingWorkshop, isLoading: isLoadingWorkshop } = useGetWorkshop(
    props.workshopId || ''
  )

  const { mutateAsync: createWorkshop, isPending: isCreating } = useCreateWorkshop()
  const { mutateAsync: updateWorkshop, isPending: isUpdating } = useUpdateWorkshop()

  const isLoading = isLoadingWorkshop
  const isSubmitting = isCreating || isUpdating

  // Load existing workshop data when editing
  useEffect(() => {
    if (existingWorkshop && props.workshopId) {
      setFormData({
        name: existingWorkshop.name || '',
        print_slips: existingWorkshop.print_slips || false,
      })
    }
  }, [existingWorkshop, props.workshopId])

  // Reset form when modal closes
  useEffect(() => {
    if (!props.isOpen) {
      setFormData({
        name: '',
        print_slips: false,
      })
      setError(null)
    }
  }, [props.isOpen])

  const handleFieldChange = useCallback(
    (field: keyof AddWorkshopFormData, value: string | boolean) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
      setError(null)
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      if (!formData.name.trim()) {
        setError('Название цеха обязательно')
        return
      }

      try {
        if (props.workshopId) {
          // Update existing workshop
          await updateWorkshop({
            id: props.workshopId,
            data: {
              name: formData.name.trim(),
              print_slips: formData.print_slips,
            },
          })
        } else {
          // Create new workshop
          await createWorkshop({
            name: formData.name.trim(),
            print_slips: formData.print_slips,
          })
        }

        props.onSuccess?.()
        props.onClose()

        // Reset form
        setFormData({
          name: '',
          print_slips: false,
        })
        setError(null)
      } catch (err) {
        console.error('Failed to save workshop:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Не удалось сохранить цех. Попробуйте еще раз.'
        )
      }
    },
    [formData, createWorkshop, updateWorkshop, props]
  )

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      props.onClose()
    }
  }, [isSubmitting, props])

  return {
    formData,
    isLoading,
    isSubmitting,
    error,
    handleFieldChange,
    handleSubmit,
    handleClose,
  }
}

