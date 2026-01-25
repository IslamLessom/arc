import { useAddIngredientModal } from '../hooks/useAddIngredientModal'
import type { AddIngredientModalProps } from '../model/types'
import { Button, Input } from '@restaurant-pos/ui'
import * as Styled from './styled'

export const AddIngredientModal = (props: AddIngredientModalProps) => {
  const {
    formData,
    isLoading,
    isSubmitting,
    error,
    categories,
    warehouses,
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
                  onChange={(e) =>
                    handleFieldChange('category_id', e.target.value)
                  }
                  disabled={isSubmitting || isLoading}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
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
                      onChange={(e) =>
                        handleFieldChange('warehouse_id', e.target.value)
                      }
                      disabled={isSubmitting || isLoading}
                    >
                      <option value="">Выберите склад</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
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
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button htmlType="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </Styled.ButtonGroup>
          </Styled.Form>
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}

