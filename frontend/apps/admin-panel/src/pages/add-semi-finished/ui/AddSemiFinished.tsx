import { useAddSemiFinished } from '../hooks/useAddSemiFinished'
import { PreparationMethod, PreparationMethodLabels } from '../model/enums'
import { translateUnit } from '../../technical-cards/lib/unitTranslator'
import * as Styled from './styled'

export const AddSemiFinished = () => {
  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    ingredients,
    totalCost,
    totalYield,
    handleFieldChange,
    addIngredient,
    removeIngredient,
    updateIngredient,
    handleSubmit,
    handleBack
  } = useAddSemiFinished()

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Добавление полуфабриката</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.PrintButton>
          <span>🖨️</span>
          Распечатать
        </Styled.PrintButton>
      </Styled.Header>

      <Styled.FormContainer>
        <Styled.FormSection>
          <Styled.FormRow>
            <Styled.FormField>
              <Styled.Label>Название</Styled.Label>
              <Styled.Input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Введите название полуфабриката"
              />
              {fieldErrors.name && (
                <Styled.ErrorMessage>{fieldErrors.name}</Styled.ErrorMessage>
              )}
            </Styled.FormField>
          </Styled.FormRow>

          <Styled.FormRow>
            <Styled.FormField>
              <Styled.Label>Процесс приготовления</Styled.Label>
              <Styled.Textarea
                value={formData.cooking_process}
                onChange={(e) => handleFieldChange('cooking_process', e.target.value)}
                placeholder="Опишите процесс приготовления..."
              />
            </Styled.FormField>
          </Styled.FormRow>
        </Styled.FormSection>

        <Styled.FormSection>
          <Styled.IngredientsSection>
            <Styled.SectionTitle>Состав</Styled.SectionTitle>

            <Styled.IngredientsTable>
              <Styled.TableHeader>
                <div>Продукты</div>
                <div>Метод приготовления</div>
                <div>Брутто</div>
                <div>Нетто</div>
                <div>
                  Себестоимость
                  <Styled.HelpIcon title="Себестоимость рассчитывается автоматически">?</Styled.HelpIcon>
                </div>
                <div></div>
              </Styled.TableHeader>

              {formData.ingredients.map((ingredient) => {
                return (
                  <Styled.TableRow key={ingredient.id}>
                    <div>
                      <Styled.TableSelect
                        value={ingredient.ingredient_id || ''}
                        onChange={(e) => {
                          updateIngredient(ingredient.id, { ingredient_id: e.target.value })
                        }}
                      >
                        <option value="">Выберите продукт</option>
                        {ingredients.map(ing => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name}
                          </option>
                        ))}
                      </Styled.TableSelect>
                    </div>
                    <div>
                      <Styled.TableSelect
                        value={ingredient.preparation_method || ''}
                        onChange={(e) => {
                          updateIngredient(ingredient.id, { preparation_method: e.target.value })
                        }}
                      >
                        <option value="">Выберите метод</option>
                        {Object.entries(PreparationMethodLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Styled.TableSelect>
                    </div>
                    <div>
                      <Styled.TableInput
                        type="number"
                        value={ingredient.gross || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0
                          updateIngredient(ingredient.id, { gross: value })
                        }}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Styled.NetInputWrapper>
                        <Styled.NetInput
                          type="number"
                          value={ingredient.net || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            updateIngredient(ingredient.id, { net: value })
                          }}
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                        <Styled.UnitLabel>{translateUnit(ingredient.unit)}</Styled.UnitLabel>
                      </Styled.NetInputWrapper>
                    </div>
                    <div>
                      <Styled.CostInputWrapper>
                        <Styled.CostInput
                          type="number"
                          value={ingredient.cost.toFixed(2)}
                          readOnly
                          style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                        />
                        <Styled.CurrencySymbol>₽</Styled.CurrencySymbol>
                      </Styled.CostInputWrapper>
                    </div>
                    <div>
                      <Styled.DeleteButton onClick={() => removeIngredient(ingredient.id)}>
                        ×
                      </Styled.DeleteButton>
                    </div>
                  </Styled.TableRow>
                )
              })}

              <Styled.AddIngredientButton onClick={addIngredient}>
                <span>+</span>
                Добавить ингредиент
              </Styled.AddIngredientButton>
            </Styled.IngredientsTable>

            <Styled.SummaryRow>
              <Styled.SummaryLabel>Выход:</Styled.SummaryLabel>
              <Styled.SummaryValue>{totalYield.toFixed(2)} г</Styled.SummaryValue>
            </Styled.SummaryRow>
            <Styled.SummaryRow>
              <Styled.SummaryLabel>Себестоимость:</Styled.SummaryLabel>
              <Styled.SummaryValue>{totalCost.toFixed(2)} ₽</Styled.SummaryValue>
            </Styled.SummaryRow>
          </Styled.IngredientsSection>
        </Styled.FormSection>
      </Styled.FormContainer>

      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fee2e2', 
          color: '#991b1b', 
          borderRadius: '8px', 
          marginTop: '16px' 
        }}>
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

