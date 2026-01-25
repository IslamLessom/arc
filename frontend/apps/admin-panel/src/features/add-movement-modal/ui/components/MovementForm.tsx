import type { MovementFormProps } from '../../model/types'
import * as Styled from '../styled'

export const MovementForm = (props: MovementFormProps) => {
  const { formData, availableItems, updateItem, removeItem, addItem } = props

  return (
    <>
      <Styled.ItemsTable>
        <Styled.ItemsTableHeader>
          <div>Название</div>
          <div>Количество</div>
          <div>Цена за единицу</div>
          <div>Сумма</div>
          <div></div>
        </Styled.ItemsTableHeader>

        {formData.items.map((item) => {
          const selectedItem = availableItems.find(
            (ai) => ai.id === (item.ingredient_id || item.product_id)
          )

          return (
            <Styled.ItemRow key={item.id}>
              <div>
                <Styled.ItemSelect
                  value={item.ingredient_id || item.product_id || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    const foundItem = availableItems.find((ai) => ai.id === value)

                    if (foundItem) {
                      updateItem(item.id, {
                        ingredient_id: foundItem.type === 'ingredient' ? foundItem.id : undefined,
                        product_id: foundItem.type === 'product' ? foundItem.id : undefined,
                        ingredient_name: foundItem.type === 'ingredient' ? foundItem.name : undefined,
                        product_name: foundItem.type === 'product' ? foundItem.name : undefined,
                        unit: foundItem.unit || 'шт',
                        price_per_unit: 0,
                      })
                    }
                  }}
                >
                  <option value="">Выберите товар</option>
                  {availableItems.map((ai) => (
                    <option key={ai.id} value={ai.id}>
                      {ai.name}
                    </option>
                  ))}
                </Styled.ItemSelect>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Styled.ItemInput
                  type="number"
                  value={item.quantity || ''}
                  onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                <span style={{ fontSize: '14px', color: '#64748b' }}>{item.unit || 'шт'}</span>
              </div>
              <div>
                <Styled.PriceInputWrapper>
                  <Styled.PriceInput
                    type="number"
                    value={item.price_per_unit || ''}
                    onChange={(e) => updateItem(item.id, { price_per_unit: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                  />
                  <Styled.CurrencySymbol>₸</Styled.CurrencySymbol>
                </Styled.PriceInputWrapper>
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                  {(item.total_amount || 0).toFixed(2)} ₸
                </span>
              </div>
              <div>
                <Styled.DeleteButton onClick={() => removeItem(item.id)}>×</Styled.DeleteButton>
              </div>
            </Styled.ItemRow>
          )
        })}

        <Styled.AddItemButton onClick={addItem}>
          <span>+</span>
          Добавить
        </Styled.AddItemButton>
      </Styled.ItemsTable>
    </>
  )
}

