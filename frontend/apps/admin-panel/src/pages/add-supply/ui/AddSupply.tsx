import { useAddSupply } from '../hooks/useAddSupply'
import { AccountType, AccountTypeLabel } from '../model/enums'
import * as Styled from './styled'

export const AddSupply = () => {
  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    warehouses,
    suppliers,
    availableItems,
    totalAmount,
    handleFieldChange,
    addItem,
    removeItem,
    updateItem,
    addPayment,
    removePayment,
    updatePayment,
    handleSubmit,
    handleBack,
    getHistoricalPrice,
    isEditMode,
    isLoadingSupply
  } = useAddSupply()

  if (isLoadingSupply) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка поставки...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>{isEditMode ? 'Редактирование поставки' : 'Добавление поставки'}</Styled.Title>
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
              <Styled.Label>Дата и время поставки</Styled.Label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Styled.Input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => handleFieldChange('delivery_date', e.target.value)}
                />
                <Styled.TimeInputs>
                  <Styled.TimeInput
                    type="text"
                    value={formData.delivery_time_hours}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 2)
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                        handleFieldChange('delivery_time_hours', value)
                      }
                    }}
                    placeholder="00"
                    maxLength={2}
                  />
                  <Styled.TimeSeparator>:</Styled.TimeSeparator>
                  <Styled.TimeInput
                    type="text"
                    value={formData.delivery_time_minutes}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 2)
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                        handleFieldChange('delivery_time_minutes', value)
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
              <Styled.Label>Поставщик</Styled.Label>
              <Styled.Select
                value={formData.supplier_id}
                onChange={(e) => handleFieldChange('supplier_id', e.target.value)}
              >
                <option value="">Выберите поставщика</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Styled.Select>
              {fieldErrors.supplier_id && (
                <Styled.ErrorMessage>{fieldErrors.supplier_id}</Styled.ErrorMessage>
              )}
            </Styled.FormField>

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
          </Styled.FormRow>

          <Styled.FormField>
            <Styled.Label>Оплата</Styled.Label>
            {formData.payments.length === 0 ? (
              <Styled.AddPaymentButton onClick={addPayment}>
                + Добавить платеж
              </Styled.AddPaymentButton>
            ) : (
              <Styled.PaymentsContainer>
                <Styled.PaymentsHeader>
                  <Styled.PaymentHeaderLabel>Счёт</Styled.PaymentHeaderLabel>
                  <Styled.PaymentHeaderLabel>Дата оплаты</Styled.PaymentHeaderLabel>
                  <Styled.PaymentHeaderLabel>Время</Styled.PaymentHeaderLabel>
                  <Styled.PaymentHeaderLabel>Сумма, ₸</Styled.PaymentHeaderLabel>
                  <div></div>
                </Styled.PaymentsHeader>
                {formData.payments.map((payment) => (
                  <Styled.PaymentRow key={payment.id}>
                    <Styled.PaymentField>
                      <Styled.PaymentSelect
                        value={payment.account_type}
                        onChange={(e) => updatePayment(payment.id, { account_type: e.target.value })}
                      >
                        <option value="">Выберите счёт</option>
                        <option value={AccountType.CurrentAccount}>
                          {AccountTypeLabel.CurrentAccount}
                        </option>
                        <option value={AccountType.Safe}>
                          {AccountTypeLabel.Safe}
                        </option>
                        <option value={AccountType.CashBox}>
                          {AccountTypeLabel.CashBox}
                        </option>
                      </Styled.PaymentSelect>
                    </Styled.PaymentField>
                    <Styled.PaymentField>
                      <Styled.PaymentInput
                        type="date"
                        value={payment.payment_date}
                        onChange={(e) => updatePayment(payment.id, { payment_date: e.target.value })}
                      />
                    </Styled.PaymentField>
                    <Styled.PaymentField>
                      <Styled.PaymentTimeInputs>
                        <Styled.PaymentTimeInput
                          type="text"
                          value={payment.payment_time_hours}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 2)
                            if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                              updatePayment(payment.id, { payment_time_hours: value })
                            }
                          }}
                          placeholder="00"
                          maxLength={2}
                        />
                        <Styled.PaymentTimeSeparator>:</Styled.PaymentTimeSeparator>
                        <Styled.PaymentTimeInput
                          type="text"
                          value={payment.payment_time_minutes}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 2)
                            if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                              updatePayment(payment.id, { payment_time_minutes: value })
                            }
                          }}
                          placeholder="00"
                          maxLength={2}
                        />
                      </Styled.PaymentTimeInputs>
                    </Styled.PaymentField>
                    <Styled.PaymentField>
                      <Styled.PaymentAmountInput
                        type="number"
                        value={payment.amount || ''}
                        onChange={(e) => updatePayment(payment.id, { amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </Styled.PaymentField>
                    <Styled.PaymentDeleteButton onClick={() => removePayment(payment.id)}>
                      🗑️
                    </Styled.PaymentDeleteButton>
                  </Styled.PaymentRow>
                ))}
                <Styled.AddPaymentButton onClick={addPayment}>
                  + Добавить платеж
                </Styled.AddPaymentButton>
              </Styled.PaymentsContainer>
            )}
          </Styled.FormField>

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
          <Styled.ImportBox>
            <Styled.ImportIcon>📊</Styled.ImportIcon>
            <Styled.ImportContent>
              <Styled.ImportTitle>Импорт поставки</Styled.ImportTitle>
              <Styled.ImportText>
                Нажмите на поле для выбора файла или перетащите в него таблицу в формате CSV, XLS, XLSX. 
                Проверьте, совпадают ли названия товаров и ингредиентов в ARCE и в таблице для импорта. 
                Добавьте новые продукты во вкладках{' '}
                <Styled.ImportLink href="/menu/products">Меню → Товары</Styled.ImportLink>
                {' '}и{' '}
                <Styled.ImportLink href="/menu/ingredients">Меню → Ингредиенты</Styled.ImportLink>.
              </Styled.ImportText>
            </Styled.ImportContent>
          </Styled.ImportBox>
        </Styled.FormSection>

        <Styled.FormSection>
          <Styled.ItemsTable>
            <Styled.ItemsTableHeader>
              <div>Наименование</div>
              <div>Фасовки</div>
              <div>Количество</div>
              <div>Цена за единицу</div>
              <div>Общая сумма</div>
              <div></div>
            </Styled.ItemsTableHeader>

            {formData.items.map((item) => {
              const selectedIngredient = item.ingredient_id 
                ? availableItems.ingredients.find(ing => ing.id === item.ingredient_id)
                : null
              const selectedProduct = item.product_id
                ? availableItems.products.find(prod => prod.id === item.product_id)
                : null
              const selectedItem = selectedIngredient || selectedProduct
              const historicalPrice = getHistoricalPrice(item.ingredient_id, item.product_id)

              return (
                <Styled.ItemRow key={item.id}>
                  <div>
                    <Styled.ItemSelect
                      value={item.ingredient_id || item.product_id || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        const ingredient = availableItems.ingredients.find(ing => ing.id === value)
                        const product = availableItems.products.find(prod => prod.id === value)
                        
                        if (ingredient) {
                          updateItem(item.id, {
                            ingredient_id: ingredient.id,
                            product_id: undefined,
                            ingredient_name: ingredient.name,
                            unit: ingredient.unit,
                            price_per_unit: historicalPrice || 0
                          })
                        } else if (product) {
                          updateItem(item.id, {
                            ingredient_id: undefined,
                            product_id: product.id,
                            product_name: product.name,
                            unit: product.unit,
                            price_per_unit: historicalPrice || 0
                          })
                        }
                      }}
                    >
                      <option value="">Выберите товар</option>
                      <optgroup label="Ингредиенты">
                        {availableItems.ingredients.map(ing => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.unit})
                          </option>
                        ))}
                      </optgroup>
                      {availableItems.products.length > 0 && (
                        <optgroup label="Товары">
                          {availableItems.products.map(prod => (
                            <option key={prod.id} value={prod.id}>
                              {prod.name} ({prod.unit})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </Styled.ItemSelect>
                  </div>
                  <div>
                    <Styled.ItemSelect
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                    >
                      <option value="шт">шт</option>
                      <option value="кг">кг</option>
                      <option value="л">л</option>
                    </Styled.ItemSelect>
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
                    <Styled.PriceInputWrapper>
                      <Styled.PriceInput
                        type="number"
                        value={item.price_per_unit || ''}
                        onChange={(e) => updateItem(item.id, { price_per_unit: parseFloat(e.target.value) || 0 })}
                        placeholder="0,00"
                        min="0"
                        step="0.01"
                      />
                      {historicalPrice > 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            left: '8px',
                            fontSize: '12px',
                            color: '#94a3b8',
                            cursor: 'pointer'
                          }}
                          title={`Историческая цена: ${historicalPrice.toFixed(2)}`}
                          onClick={() => updateItem(item.id, { price_per_unit: historicalPrice })}
                        >
                          🕐
                        </span>
                      )}
                      <Styled.CurrencySymbol>₽</Styled.CurrencySymbol>
                    </Styled.PriceInputWrapper>
                  </div>
                  <div>
                    <Styled.PriceInputWrapper>
                      <Styled.PriceInput
                        type="number"
                        value={item.total_amount || ''}
                        onChange={(e) => updateItem(item.id, { total_amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0,00"
                        min="0"
                        step="0.01"
                      />
                      <Styled.CurrencySymbol>₽</Styled.CurrencySymbol>
                    </Styled.PriceInputWrapper>
                  </div>
                  <div>
                    <Styled.DeleteButton onClick={() => removeItem(item.id)}>
                      🗑️
                    </Styled.DeleteButton>
                  </div>
                </Styled.ItemRow>
              )
            })}

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
        <Styled.Summary>
          <Styled.SummaryRow>
            <Styled.SummaryLabel>К оплате:</Styled.SummaryLabel>
            <Styled.SummaryValue>0 ₽</Styled.SummaryValue>
          </Styled.SummaryRow>
          <Styled.SummaryRow>
            <Styled.SummaryLabel>Итого:</Styled.SummaryLabel>
            <Styled.SummaryValue>{totalAmount.toFixed(2)} ₽</Styled.SummaryValue>
          </Styled.SummaryRow>
        </Styled.Summary>
      </Styled.Footer>
    </Styled.PageContainer>
  )
}

