import { useAddWriteOff } from '../hooks/useAddWriteOff'
import { useGetWriteOffReasons } from '@restaurant-pos/api-client'
import { ItemSelect } from './components/ItemSelect'
import * as Styled from './styled'

export const AddWriteOff = () => {
  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    warehouses,
    availableItems,
    handleFieldChange,
    addItem,
    removeItem,
    updateItem,
    handleSubmit,
    handleBack,
    handleManageReasons,
  } = useAddWriteOff()

  const { data: reasons, isLoading: isLoadingReasons } = useGetWriteOffReasons()

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Добавление списания</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.PrintButton>
          <span>🖨️</span>
          Печать
        </Styled.PrintButton>
      </Styled.Header>

      <Styled.FormContainer>
        <Styled.FormSection>
          <Styled.FormRow>
            <Styled.FormField>
              <Styled.Label>Дата и время списания</Styled.Label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Styled.Input
                  type="date"
                  value={formData.write_off_date}
                  onChange={(e) => handleFieldChange('write_off_date', e.target.value)}
                />
                <Styled.TimeInputs>
                  <Styled.TimeInput
                    type="text"
                    value={formData.write_off_time_hours}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 2)
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                        handleFieldChange('write_off_time_hours', value)
                      }
                    }}
                    placeholder="00"
                    maxLength={2}
                  />
                  <Styled.TimeSeparator>:</Styled.TimeSeparator>
                  <Styled.TimeInput
                    type="text"
                    value={formData.write_off_time_minutes}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 2)
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                        handleFieldChange('write_off_time_minutes', value)
                      }
                    }}
                    placeholder="00"
                    maxLength={2}
                  />
                </Styled.TimeInputs>
              </div>
            </Styled.FormField>
          </Styled.FormRow>

          <Styled.FormRow>
            <Styled.FormField>
              <Styled.Label>Склад</Styled.Label>
              <Styled.Select
                value={formData.warehouse_id}
                onChange={(e) => handleFieldChange('warehouse_id', e.target.value)}
              >
                <option value="">Выберите склад</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </Styled.Select>
              {fieldErrors.warehouse_id && (
                <Styled.ErrorMessage>{fieldErrors.warehouse_id}</Styled.ErrorMessage>
              )}
            </Styled.FormField>

            <Styled.FormField>
              <Styled.Label>Причина</Styled.Label>
              <Styled.Select
                value={formData.reason}
                onChange={(e) => handleFieldChange('reason', e.target.value)}
                disabled={isLoadingReasons}
              >
                <option value="">Выберите причину</option>
                {reasons?.filter(r => r.active).map(reason => (
                  <option key={reason.id} value={reason.id}>
                    {reason.name}
                  </option>
                ))}
              </Styled.Select>
              <Styled.Link
                onClick={handleManageReasons}
                style={{ marginTop: '4px' }}
              >
                Управление причинами списаний
              </Styled.Link>
            </Styled.FormField>
          </Styled.FormRow>

          <Styled.FormField>
            <Styled.Label>Комментарий</Styled.Label>
            <Styled.Textarea
              value={formData.comment}
              onChange={(e) => handleFieldChange('comment', e.target.value)}
              placeholder="Введите комментарий..."
            />
          </Styled.FormField>
        </Styled.FormSection>

        <Styled.FormSection>
          <Styled.ItemsTable>
            <Styled.ItemsTableHeader>
              <div>Что списывается</div>
              <div>Количество</div>
              <div>Детали</div>
              <div></div>
            </Styled.ItemsTableHeader>

            {formData.items.map((item) => (
              <Styled.ItemRow key={item.id}>
                <div>
                  <ItemSelect
                    value={item.ingredient_id || item.product_id}
                    items={availableItems}
                    onChange={(itemId, itemName, unit, type) => {
                      if (type === 'ingredient') {
                        updateItem(item.id, {
                          ingredient_id: itemId,
                          product_id: undefined,
                          ingredient_name: itemName,
                          unit
                        })
                      } else {
                        updateItem(item.id, {
                          product_id: itemId,
                          ingredient_id: undefined,
                          product_name: itemName,
                          unit
                        })
                      }
                    }}
                  />
                </div>
                <div>
                  <Styled.ItemInput
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Styled.ItemInput
                    type="text"
                    value={item.details}
                    onChange={(e) => updateItem(item.id, { details: e.target.value })}
                    placeholder="Детали списания"
                  />
                </div>
                <div>
                  <Styled.DeleteButton onClick={() => removeItem(item.id)}>
                    🗑️
                  </Styled.DeleteButton>
                </div>
              </Styled.ItemRow>
            ))}

            <Styled.AddItemButton onClick={addItem}>
              <span>+</span>
              Добавить еще
            </Styled.AddItemButton>
          </Styled.ItemsTable>
        </Styled.FormSection>
      </Styled.FormContainer>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginTop: '16px' }}>
          {error}
        </div>
      )}

      <Styled.Footer>
        <Styled.SaveButton
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </Styled.SaveButton>
      </Styled.Footer>
    </Styled.PageContainer>
  )
}

