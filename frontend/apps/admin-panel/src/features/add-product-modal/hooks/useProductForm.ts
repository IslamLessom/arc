import { useCallback, useState } from 'react'
import { useUploadImage } from '@restaurant-pos/api-client'
import type { ProductFormProps, UseProductFormResult } from '../model/types'
import { handleImageUpload } from '../lib/fileUpload'

export const useProductForm = (props: ProductFormProps): UseProductFormResult => {
  const { handleFieldChange } = props
  const uploadImage = useUploadImage()
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFieldChange('name', e.target.value)
    },
    [handleFieldChange]
  )

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      if (value === '__add_new__') {
        props.onAddCategoryClick?.()
        // Reset select to previous value
        e.target.value = props.formData.category_id || ''
      } else {
        handleFieldChange('category_id', value)
      }
    },
    [handleFieldChange, props]
  )

  const handleWarehouseChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      if (value === '__add_new__') {
        props.onAddWarehouseClick?.()
        e.target.value = props.formData.warehouse_id || ''
      } else {
        handleFieldChange('warehouse_id', value)
      }
    },
    [handleFieldChange, props]
  )

  const handleWorkshopChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      if (value === '__add_new__') {
        props.onAddWorkshopClick?.()
        e.target.value = props.formData.workshop_id || ''
      } else {
        handleFieldChange('workshop_id', value)
      }
    },
    [handleFieldChange, props]
  )

  const handleImageFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      handleImageUpload(file, async (file) => {
        setIsUploadingImage(true)
        try {
          const imageUrl = await uploadImage.mutateAsync(file)
          handleFieldChange('cover_image', imageUrl)
        } catch (error) {
          console.error('Failed to upload image:', error)
        } finally {
          setIsUploadingImage(false)
        }
      })
    },
    [handleFieldChange, uploadImage]
  )

  const handleWeightedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFieldChange('is_weighted', e.target.checked)
    },
    [handleFieldChange]
  )

  const handleExcludeFromDiscountsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFieldChange('exclude_from_discounts', e.target.checked)
    },
    [handleFieldChange]
  )

  const handleModificationsWithoutChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFieldChange('has_modifications', false)
    },
    [handleFieldChange]
  )

  const handleModificationsWithChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFieldChange('has_modifications', true)
    },
    [handleFieldChange]
  )

  const handleBarcodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFieldChange('barcode', e.target.value)
    },
    [handleFieldChange]
  )

  const handleCostPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFieldChange('cost_price', e.target.value)
    },
    [handleFieldChange]
  )

  const handleMarkupChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFieldChange('markup', e.target.value)
    },
    [handleFieldChange]
  )

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFieldChange('price', e.target.value)
    },
    [handleFieldChange]
  )

  return {
    handleNameChange,
    handleCategoryChange,
    handleWarehouseChange,
    handleWorkshopChange,
    handleImageFileChange,
    handleWeightedChange,
    handleExcludeFromDiscountsChange,
    handleModificationsWithoutChange,
    handleModificationsWithChange,
    handleBarcodeChange,
    handleCostPriceChange,
    handleMarkupChange,
    handlePriceChange,
  }
}
