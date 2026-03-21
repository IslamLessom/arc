import { useState } from 'react'
import { useAddIngredientModal } from '../hooks/useAddIngredientModal'
import type { AddIngredientModalProps } from '../model/types'
import { Button, Input, ButtonVariant } from '@restaurant-pos/ui'
import * as Styled from './styled'
import {
  useCreateIngredientCategory,
  useCreateWarehouse,
  useGetIngredientCategories,
  useGetWarehouses,
} from '@restaurant-pos/api-client'

const AddIngredientCategoryDialog = ({
  isOpen,
  onClose,
  onCategoryAdded,
}: AddIngredientCategoryDialogProps) => {
  const [categoryName, setCategoryName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createCategoryMutation = useCreateIngredientCategory()
  const { refetch: refetchCategories } = useGetIngredientCategories()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = categoryName.trim()
    if (!trimmedName) {
      setError('Введите название категории')
      return
    }

    try {
      const newCategory = await createCategoryMutation.mutateAsync({
        name: trimmedName,
      })

      await refetchCategories()
      onCategoryAdded?.(newCategory.id)
      onClose()
      setCategoryName('')
    } catch (err) {
      console.error('Failed to create ingredient category:', err)
      setError('Ошибка при создании категории')
    }
  }

  return (
    <Styled.DialogOverlay $isOpen={isOpen} onClick={onClose}>
      <Styled.DialogContainer onClick={(e) => e.stopPropagation()}>
        <Styled.DialogHeader>
          <Styled.DialogTitle>Добавить категорию ингредиентов</Styled.DialogTitle>
          <Styled.DialogCloseButton onClick={onClose}>×</Styled.DialogCloseButton>
        </Styled.DialogHeader>

        <Styled.DialogForm onSubmit={handleSubmit}>
          <Styled.DialogInputGroup>
            <Styled.DialogLabel>
              Название <Styled.Required>*</Styled.Required>
            </Styled.DialogLabel>
            <Styled.DialogInput
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Например, «Овощи» или «Мясо»"
              disabled={createCategoryMutation.isPending}
              autoFocus
            />
          </Styled.DialogInputGroup>

          {error && <Styled.FieldError>{error}</Styled.FieldError>}

          <Styled.DialogButtonGroup>
            <Styled.DialogCancelButton type="button" onClick={onClose}>
              Отмена
            </Styled.DialogCancelButton>
            <Styled.DialogSubmitButton
              type="submit"
              $disabled={createCategoryMutation.isPending || !categoryName.trim()}
            >
              {createCategoryMutation.isPending ? 'Добавление...' : 'Добавить'}
            </Styled.DialogSubmitButton>
          </Styled.DialogButtonGroup>
        </Styled.DialogForm>
      </Styled.DialogContainer>
    </Styled.DialogOverlay>
  )
}

const AddWarehouseDialog = ({ isOpen, onClose, onWarehouseAdded }: AddWarehouseDialogProps) => {
  const [warehouseName, setWarehouseName] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const createWarehouseMutation = useCreateWarehouse()
  const { refetch: refetchWarehouses } = useGetWarehouses()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = warehouseName.trim()
    if (!trimmedName) {
      setError('Введите название склада')
      return
    }

    try {
      const newWarehouse = await createWarehouseMutation.mutateAsync({
        name: trimmedName,
      })
      
      await refetchWarehouses()
      onWarehouseAdded?.(newWarehouse.id)
      onClose()
      setWarehouseName('')
    } catch (err) {
      console.error('Failed to create warehouse:', err)
      setError('Ошибка при создании склада')
    }
  }

  return (
    <Styled.DialogOverlay $isOpen={isOpen} onClick={onClose}>
      <Styled.DialogContainer onClick={(e) => e.stopPropagation()}>
        <Styled.DialogHeader>
          <Styled.DialogTitle>Добавить склад</Styled.DialogTitle>
          <Styled.DialogCloseButton onClick={onClose}>×</Styled.DialogCloseButton>
        </Styled.DialogHeader>

        <Styled.DialogForm onSubmit={handleSubmit}>
          <Styled.DialogInputGroup>
            <Styled.DialogLabel>
              Название <Styled.Required>*</Styled.Required>
            </Styled.DialogLabel>
            <Styled.DialogInput
              type="text"
              value={warehouseName}
              onChange={(e) => setWarehouseName(e.target.value)}
              placeholder="Например, «Основной склад»"
              disabled={createWarehouseMutation.isPending}
              autoFocus
            />
          </Styled.DialogInputGroup>

          {error && <Styled.FieldError>{error}</Styled.FieldError>}

          <Styled.DialogButtonGroup>
            <Styled.DialogCancelButton type="button" onClick={onClose}>
              Отмена
            </Styled.DialogCancelButton>
            <Styled.DialogSubmitButton 
              type="submit"
              $disabled={createWarehouseMutation.isPending || !warehouseName.trim()}
            >
              {createWarehouseMutation.isPending ? 'Добавление...' : 'Добавить'}
            </Styled.DialogSubmitButton>
          </Styled.DialogButtonGroup>
        </Styled.DialogForm>
      </Styled.DialogContainer>
    </Styled.DialogOverlay>
  )
}

interface AddWarehouseDialogProps {
  isOpen: boolean
  onClose: () => void
  onWarehouseAdded?: (warehouseId: string) => void
}

interface AddIngredientCategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onCategoryAdded?: (categoryId: string) => void
}

export const AddIngredientModal = (props: AddIngredientModalProps) => {
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
  const [isAddWarehouseDialogOpen, setIsAddWarehouseDialogOpen] = useState(false)

  const {
    formData,
    isLoading,
    isSubmitting,
    error,
    categories,
    warehouses,
    refetchCategories,
    refetchWarehouses,
    handleFieldChange,
    handleSubmit,
    handleClose,
    showAdditionalFields,
    toggleAdditionalFields,
    showWarehouseFields,
    toggleWarehouseFields,
  } = useAddIngredientModal(props)

  if (!props.isOpen) {
    return null
  }

  return (
    <Styled.Overlay $isOpen={props.isOpen} onClick={handleClose}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.ModalTitle>Добавление ингредиента</Styled.ModalTitle>
          <Styled.CloseButton onClick={handleClose}>×</Styled.CloseButton>
        </Styled.ModalHeader>
        <Styled.ModalBody>
          <Styled.Form onSubmit={handleSubmit}>
            <Styled.FormSection>
              <Styled.InputGroup>
                <Styled.Label>
                  Название <Styled.Required>*</Styled.Required>
                </Styled.Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Введите название ингредиента"
                  disabled={isSubmitting}
                  required
                />
              </Styled.InputGroup>

              <Styled.InputGroup>
                <Styled.Label>
                  Категория <Styled.Required>*</Styled.Required>
                </Styled.Label>
                <Styled.Select
                  value={formData.category_id}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '__add_new__') {
                      setIsAddCategoryDialogOpen(true)
                      e.target.value = formData.category_id || ''
                    } else {
                      handleFieldChange('category_id', value)
                    }
                  }}
                  disabled={isSubmitting || isLoading}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  <option value="__add_new__" style={{ fontWeight: 500, color: '#3b82f6' }}>+ Добавить категорию</option>
                </Styled.Select>
              </Styled.InputGroup>

              <Styled.InputGroup>
                <Styled.Label>
                  Ед. измерения <Styled.Required>*</Styled.Required>
                </Styled.Label>
                <Styled.Select
                  value={formData.unit}
                  onChange={(e) =>
                    handleFieldChange('unit', e.target.value as 'шт' | 'л' | 'кг')
                  }
                  disabled={isSubmitting}
                  required
                >
                  <option value="кг">кг</option>
                  <option value="л">л</option>
                  <option value="шт">шт</option>
                </Styled.Select>
              </Styled.InputGroup>

              <Styled.ToggleLink
                type="button"
                onClick={toggleAdditionalFields}
                disabled={isSubmitting}
              >
                {showAdditionalFields ? '▼' : '▶'} Дополнительно
              </Styled.ToggleLink>

              {showAdditionalFields && (
                <>
                  <Styled.InputGroup>
                    <Styled.Label>Штрихкод</Styled.Label>
                    <Input
                      value={formData.barcode || ''}
                      onChange={(e) =>
                        handleFieldChange('barcode', e.target.value)
                      }
                      placeholder="Введите штрихкод"
                      disabled={isSubmitting}
                    />
                  </Styled.InputGroup>

                  <Styled.InputGroup>
                    <Styled.Label>Потери при чистке (%)</Styled.Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.loss_cleaning || 0}
                      onChange={(e) =>
                        handleFieldChange(
                          'loss_cleaning',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={isSubmitting}
                    />
                  </Styled.InputGroup>

                  <Styled.InputGroup>
                    <Styled.Label>Потери при варке (%)</Styled.Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.loss_boiling || 0}
                      onChange={(e) =>
                        handleFieldChange(
                          'loss_boiling',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={isSubmitting}
                    />
                  </Styled.InputGroup>

                  <Styled.InputGroup>
                    <Styled.Label>Потери при жарке (%)</Styled.Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.loss_frying || 0}
                      onChange={(e) =>
                        handleFieldChange(
                          'loss_frying',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={isSubmitting}
                    />
                  </Styled.InputGroup>

                  <Styled.InputGroup>
                    <Styled.Label>Потери при тушении (%)</Styled.Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.loss_stewing || 0}
                      onChange={(e) =>
                        handleFieldChange(
                          'loss_stewing',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={isSubmitting}
                    />
                  </Styled.InputGroup>

                  <Styled.InputGroup>
                    <Styled.Label>Потери при запекании (%)</Styled.Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.loss_baking || 0}
                      onChange={(e) =>
                        handleFieldChange(
                          'loss_baking',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={isSubmitting}
                    />
                  </Styled.InputGroup>
                </>
              )}
            </Styled.FormSection>

            <Styled.FormSection>
              <Styled.SectionTitle>Складской учет</Styled.SectionTitle>
              <Styled.SectionDescription>
                Если вы уже купили этот продукт, укажите его количество, цену и
                склад хранения. ARCE создаст поставку ингредиента и рассчитает
                себестоимость блюд и напитков.{' '}
                <Styled.ToggleLink
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    // TODO: Add link to documentation
                  }}
                >
                  Узнайте больше о складском учёте
                </Styled.ToggleLink>
              </Styled.SectionDescription>

              {showWarehouseFields && (
                <>
                  <Styled.InputGroup>
                    <Styled.Label>Кол-во в наличии</Styled.Label>
                    <Styled.InputWrapper>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.quantity || 0}
                        onChange={(e) =>
                          handleFieldChange(
                            'quantity',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        disabled={isSubmitting}
                        style={{ flex: 1 }}
                      />
                      <Styled.UnitLabel>{formData.unit}</Styled.UnitLabel>
                    </Styled.InputWrapper>
                  </Styled.InputGroup>

                  <Styled.InputGroup>
                    <Styled.Label>Цена за {formData.unit}</Styled.Label>
                    <Styled.InputWrapper>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price_per_unit || 0}
                        onChange={(e) =>
                          handleFieldChange(
                            'price_per_unit',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        disabled={isSubmitting}
                        style={{ flex: 1 }}
                      />
                      <Styled.UnitLabel>₽</Styled.UnitLabel>
                    </Styled.InputWrapper>
                  </Styled.InputGroup>

                  <Styled.InputGroup>
                    <Styled.Label>Склад</Styled.Label>
                    <Styled.Select
                      value={formData.warehouse_id || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '__add_new__') {
                          setIsAddWarehouseDialogOpen(true)
                          e.target.value = formData.warehouse_id || ''
                        } else {
                          handleFieldChange('warehouse_id', value)
                        }
                      }}
                      disabled={isSubmitting || isLoading}
                    >
                      <option value="">Выберите склад</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                      <option value="__add_new__" style={{ fontWeight: 500, color: '#3b82f6' }}>+ Добавить склад</option>
                    </Styled.Select>
                  </Styled.InputGroup>
                </>
              )}

              {!showWarehouseFields && (
                <Styled.ToggleLink
                  type="button"
                  onClick={toggleWarehouseFields}
                  disabled={isSubmitting}
                >
                  ▶ Указать складские данные
                </Styled.ToggleLink>
              )}

              {showWarehouseFields && (
                <Styled.ToggleLink
                  type="button"
                  onClick={toggleWarehouseFields}
                  disabled={isSubmitting}
                >
                  ▼ Скрыть складские данные
                </Styled.ToggleLink>
              )}
            </Styled.FormSection>

            {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}

            <Styled.ButtonGroup>
              <Button
                htmlType="button"
                variant={ButtonVariant.Outline}
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button htmlType="submit" disabled={isSubmitting || isLoading || !formData.name.trim() || !formData.category_id}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </Styled.ButtonGroup>
          </Styled.Form>
        </Styled.ModalBody>
      </Styled.ModalContainer>

      <AddIngredientCategoryDialog
        isOpen={isAddCategoryDialogOpen}
        onClose={() => setIsAddCategoryDialogOpen(false)}
        onCategoryAdded={(categoryId) => {
          handleFieldChange('category_id', categoryId)
          setIsAddCategoryDialogOpen(false)
          refetchCategories?.()
        }}
      />

      <AddWarehouseDialog 
        isOpen={isAddWarehouseDialogOpen}
        onClose={() => setIsAddWarehouseDialogOpen(false)}
        onWarehouseAdded={(warehouseId) => {
          handleFieldChange('warehouse_id', warehouseId)
          setIsAddWarehouseDialogOpen(false)
          refetchWarehouses?.()
        }}
      />
    </Styled.Overlay>
  )
}

