import React from 'react'
import { Button, Input } from '@restaurant-pos/ui'
import type { IngredientFormProps } from '../model/types'
import * as Styled from './styled'

export const IngredientForm: React.FC<IngredientFormProps> = ({
  formData,
  isSubmitting = false,
  categories,
  warehouses = [],
  onFieldChange,
  onSubmit,
  showAdditionalFields = false,
  toggleAdditionalFields,
  showWarehouseFields = false,
  toggleWarehouseFields,
  mode = 'create'
}) => {
  return (
    <Styled.Form onSubmit={onSubmit}>
      <Styled.FormSection>
        <Styled.InputGroup>
          <Styled.Label>
            Название <Styled.Required>*</Styled.Required>
          </Styled.Label>
          <Input
            value={formData.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
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
              onFieldChange('category_id', e.target.value)
            }
            disabled={isSubmitting}
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
              onFieldChange('unit', e.target.value as 'шт' | 'л' | 'кг')
            }
            disabled={isSubmitting}
            required
          >
            <option value="кг">кг</option>
            <option value="л">л</option>
            <option value="шт">шт</option>
          </Styled.Select>
        </Styled.InputGroup>

        {toggleAdditionalFields && (
          <Styled.ToggleLink
            type="button"
            onClick={toggleAdditionalFields}
            disabled={isSubmitting}
          >
            {showAdditionalFields ? '▼' : '▶'} Дополнительно
          </Styled.ToggleLink>
        )}

        {showAdditionalFields && (
          <Styled.AdditionalFieldsContainer>
            <Styled.InputGroup>
              <Styled.AdditionalLabel>Штрихкод</Styled.AdditionalLabel>
              <Input
                value={formData.barcode || ''}
                onChange={(e) =>
                  onFieldChange('barcode', e.target.value)
                }
                placeholder="Введите штрихкод"
                disabled={isSubmitting}
              />
            </Styled.InputGroup>

            <Styled.InputGroup>
              <Styled.AdditionalLabel>Потери при чистке (%)</Styled.AdditionalLabel>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.loss_cleaning || 0}
                onChange={(e) =>
                  onFieldChange(
                    'loss_cleaning',
                    parseFloat(e.target.value) || 0
                  )
                }
                disabled={isSubmitting}
              />
            </Styled.InputGroup>

            <Styled.InputGroup>
              <Styled.AdditionalLabel>Потери при варке (%)</Styled.AdditionalLabel>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.loss_boiling || 0}
                onChange={(e) =>
                  onFieldChange(
                    'loss_boiling',
                    parseFloat(e.target.value) || 0
                  )
                }
                disabled={isSubmitting}
              />
            </Styled.InputGroup>

            <Styled.InputGroup>
              <Styled.AdditionalLabel>Потери при жарке (%)</Styled.AdditionalLabel>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.loss_frying || 0}
                onChange={(e) =>
                  onFieldChange(
                    'loss_frying',
                    parseFloat(e.target.value) || 0
                  )
                }
                disabled={isSubmitting}
              />
            </Styled.InputGroup>

            <Styled.InputGroup>
              <Styled.AdditionalLabel>Потери при тушении (%)</Styled.AdditionalLabel>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.loss_stewing || 0}
                onChange={(e) =>
                  onFieldChange(
                    'loss_stewing',
                    parseFloat(e.target.value) || 0
                  )
                }
                disabled={isSubmitting}
              />
            </Styled.InputGroup>

            <Styled.InputGroup>
              <Styled.AdditionalLabel>Потери при запекании (%)</Styled.AdditionalLabel>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.loss_baking || 0}
                onChange={(e) =>
                  onFieldChange(
                    'loss_baking',
                    parseFloat(e.target.value) || 0
                  )
                }
                disabled={isSubmitting}
              />
            </Styled.InputGroup>
          </Styled.AdditionalFieldsContainer>
        )}
      </Styled.FormSection>

      {mode === 'create' && toggleWarehouseFields && (
        <Styled.FormSection>
          <Styled.SectionTitle>Складской учет</Styled.SectionTitle>
          <Styled.SectionDescription>
            Если вы уже купили этот продукт, укажите его количество, цену и
            склад хранения. ARCE создаст поставку ингредиента и рассчитает
            себестоимость блюд и напитков.{' '}
            <Styled.UnderlinedToggleLink
              type="button"
              onClick={(e) => {
                e.preventDefault()
                // TODO: Add link to documentation
              }}
            >
              Узнайте больше о складском учёте
            </Styled.UnderlinedToggleLink>
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
                      onFieldChange(
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
                      onFieldChange(
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
                    onFieldChange('warehouse_id', e.target.value)
                  }
                  disabled={isSubmitting}
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
      )}

      <Styled.ButtonGroup>
        <Button
          type="button"
          variant="outline"
          onClick={() => {}}
          disabled={isSubmitting}
        >
          Отмена
        </Button>
        <Button htmlType="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </Styled.ButtonGroup>
    </Styled.Form>
  )
}