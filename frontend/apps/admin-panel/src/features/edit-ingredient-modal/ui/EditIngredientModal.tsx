import { useState, useEffect } from 'react'
import { useGetIngredient, useUpdateIngredient, useGetIngredientCategories, useGetWarehouses } from '@restaurant-pos/api-client'
import type { EditIngredientModalProps } from '../model/types'
import { IngredientForm } from '../../ingredient-form'
import type { IngredientFormData } from '../../ingredient-form/model/types'
import * as Styled from './styled'

export const EditIngredientModal = (props: EditIngredientModalProps) => {
  const { isOpen, onClose, onSuccess, ingredientId } = props
  
  const [showAdditionalFields, setShowAdditionalFields] = useState(false)
  const [formData, setFormData] = useState<IngredientFormData>({
    name: '',
    category_id: '',
    unit: 'кг',
    barcode: '',
    loss_cleaning: 0,
    loss_boiling: 0,
    loss_frying: 0,
    loss_stewing: 0,
    loss_baking: 0,
  })

  const { data: ingredient, isLoading: ingredientLoading } = useGetIngredient(ingredientId)
  const { data: categories = [], isLoading: categoriesLoading } = useGetIngredientCategories()
  const { data: warehouses = [], isLoading: warehousesLoading } = useGetWarehouses()
  
  const updateMutation = useUpdateIngredient()

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        category_id: ingredient.category_id,
        unit: ingredient.unit,
        barcode: ingredient.barcode || '',
        loss_cleaning: ingredient.loss_cleaning || 0,
        loss_boiling: ingredient.loss_boiling || 0,
        loss_frying: ingredient.loss_frying || 0,
        loss_stewing: ingredient.loss_stewing || 0,
        loss_baking: ingredient.loss_baking || 0,
      })
    }
  }, [ingredient])

  const handleFieldChange = (field: keyof IngredientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await updateMutation.mutateAsync({
        id: ingredientId,
        data: {
          name: formData.name,
          category_id: formData.category_id,
          unit: formData.unit,
          barcode: formData.barcode,
          loss_cleaning: formData.loss_cleaning,
          loss_boiling: formData.loss_boiling,
          loss_frying: formData.loss_frying,
          loss_stewing: formData.loss_stewing,
          loss_baking: formData.loss_baking,
        }
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to update ingredient:', error)
    }
  }

  const handleClose = () => {
    if (!updateMutation.isPending) {
      onClose()
    }
  }

  const toggleAdditionalFields = () => {
    setShowAdditionalFields(prev => !prev)
  }

  if (!isOpen) {
    return null
  }

  return (
    <Styled.Overlay $isOpen={isOpen} onClick={handleClose}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.ModalTitle>Редактирование ингредиента</Styled.ModalTitle>
          <Styled.CloseButton onClick={handleClose}>×</Styled.CloseButton>
        </Styled.ModalHeader>
        <Styled.ModalBody>
          <IngredientForm
            formData={formData}
            isSubmitting={updateMutation.isPending}
            categories={categories}
            warehouses={warehouses}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            showAdditionalFields={showAdditionalFields}
            toggleAdditionalFields={toggleAdditionalFields}
            mode="edit"
          />
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}