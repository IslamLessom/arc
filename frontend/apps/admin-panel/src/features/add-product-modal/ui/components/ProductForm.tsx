import * as Styled from '../styled'
import { FORM_LABELS, PLACEHOLDERS, MODIFICATION_TYPES } from '../../lib/constants'
import type { ProductFormProps } from '../../model/types'
import { useProductForm } from '../../hooks/useProductForm'

export const ProductForm = (props: ProductFormProps) => {
  const {
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
  } = useProductForm(props)

  const { formData, fieldErrors, isSubmitting, categories, workshops, warehouses, firstFocusableRef } = props

  return (
  <Styled.FormRows>
    <Styled.FormRow>
      <Styled.RowLabel>
        {FORM_LABELS.NAME} <Styled.Required>*</Styled.Required>
      </Styled.RowLabel>
      <Styled.RowContent>
        <Styled.StyledInput
          ref={firstFocusableRef}
          value={formData.name}
          onChange={handleNameChange}
          placeholder={PLACEHOLDERS.NAME}
          disabled={isSubmitting}
          $hasError={!!fieldErrors?.name}
        />
        {fieldErrors?.name && <Styled.FieldError>{fieldErrors.name}</Styled.FieldError>}
      </Styled.RowContent>
    </Styled.FormRow>

    <Styled.FormRow>
      <Styled.RowLabel>
        {FORM_LABELS.CATEGORY} <Styled.Required>*</Styled.Required>
      </Styled.RowLabel>
      <Styled.RowContent>
        <Styled.Select
          value={formData.category_id}
          onChange={handleCategoryChange}
          disabled={isSubmitting}
          $hasError={!!fieldErrors?.category_id}
        >
          <option value="">{PLACEHOLDERS.SELECT_CATEGORY}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Styled.Select>
        {fieldErrors?.category_id && <Styled.FieldError>{fieldErrors.category_id}</Styled.FieldError>}
      </Styled.RowContent>
    </Styled.FormRow>

    <Styled.FormRow>
      <Styled.RowLabel>
        {FORM_LABELS.WAREHOUSE} <Styled.Required>*</Styled.Required>
      </Styled.RowLabel>
      <Styled.RowContent>
        <Styled.Select
          value={formData.warehouse_id}
          onChange={handleWarehouseChange}
          disabled={isSubmitting}
          $hasError={!!fieldErrors?.warehouse_id}
        >
          <option value="">{PLACEHOLDERS.SELECT_WAREHOUSE}</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </Styled.Select>
        {fieldErrors?.warehouse_id && <Styled.FieldError>{fieldErrors.warehouse_id}</Styled.FieldError>}
      </Styled.RowContent>
    </Styled.FormRow>

    <Styled.FormRow>
      <Styled.RowLabel>{FORM_LABELS.WORKSHOP}</Styled.RowLabel>
      <Styled.RowContent>
        <Styled.Select
          value={formData.workshop_id || ''}
          onChange={handleWorkshopChange}
          disabled={isSubmitting}
        >
          <option value="">{PLACEHOLDERS.NO_WORKSHOP}</option>
          {workshops.map((workshop) => (
            <option key={workshop.id} value={workshop.id}>
              {workshop.name}
            </option>
          ))}
        </Styled.Select>
      </Styled.RowContent>
    </Styled.FormRow>

    <Styled.FormRow>
      <Styled.RowLabel>{FORM_LABELS.COVER}</Styled.RowLabel>
      <Styled.RowContent>
        {formData.cover_image ? (
          <Styled.CoverImagePreview>
            <img src={formData.cover_image} alt="Product cover" />
            <Styled.RemoveImageButton
              type="button"
              onClick={() => props.handleFieldChange('cover_image', '')}
            >
              ×
            </Styled.RemoveImageButton>
          </Styled.CoverImagePreview>
        ) : (
          <Styled.CoverImagePlaceholder>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              disabled={isSubmitting}
            />
            <span>{PLACEHOLDERS.UPLOAD_IMAGE}</span>
          </Styled.CoverImagePlaceholder>
        )}
      </Styled.RowContent>
    </Styled.FormRow>

    <Styled.FormRow>
      <Styled.RowLabel>{FORM_LABELS.OPTIONS}</Styled.RowLabel>
      <Styled.RowContent>
        <Styled.Checkbox>
          <input
            type="checkbox"
            checked={formData.is_weighted}
            onChange={handleWeightedChange}
            disabled={isSubmitting}
          />
          {FORM_LABELS.WEIGHTED_PRODUCT}
        </Styled.Checkbox>
        <Styled.Checkbox>
          <input
            type="checkbox"
            checked={formData.exclude_from_discounts}
            onChange={handleExcludeFromDiscountsChange}
            disabled={isSubmitting}
          />
          {FORM_LABELS.EXCLUDE_FROM_DISCOUNTS}
        </Styled.Checkbox>
      </Styled.RowContent>
    </Styled.FormRow>

    <Styled.FormRow>
      <Styled.RowLabel>{FORM_LABELS.PRICE_AND_BARCODE}</Styled.RowLabel>
      <Styled.RowContent>
        <Styled.ModificationsGroup>
          <Styled.RadioGroup>
            <Styled.Radio>
              <input
                type="radio"
                name="modifications"
                checked={!formData.has_modifications}
                onChange={handleModificationsWithoutChange}
                disabled={isSubmitting}
              />
              <span>{MODIFICATION_TYPES.WITHOUT}</span>
            </Styled.Radio>
            <Styled.Radio>
              <input
                type="radio"
                name="modifications"
                checked={formData.has_modifications}
                onChange={handleModificationsWithChange}
                disabled={isSubmitting}
              />
              <span>{MODIFICATION_TYPES.WITH}</span>
            </Styled.Radio>
          </Styled.RadioGroup>

          <Styled.BarcodeInput>
            <Styled.RowLabel>{FORM_LABELS.BARCODE}</Styled.RowLabel>
            <Styled.StyledInput
              value={formData.barcode}
              onChange={handleBarcodeChange}
              placeholder={PLACEHOLDERS.BARCODE}
              disabled={isSubmitting}
              $hasError={!!fieldErrors?.barcode}
            />
            {fieldErrors?.barcode && <Styled.FieldError>{fieldErrors.barcode}</Styled.FieldError>}
          </Styled.BarcodeInput>

          <Styled.PriceCalculation>
            <Styled.PriceInputWrapper>
              <Styled.RowLabel>{FORM_LABELS.COST_PRICE}</Styled.RowLabel>
              <Styled.PriceInputGroup>
                <Styled.StyledInput
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={handleCostPriceChange}
                  placeholder="0"
                  disabled={isSubmitting}
                  $hasError={!!fieldErrors?.cost_price}
                />
                <Styled.CurrencySymbol>₽</Styled.CurrencySymbol>
              </Styled.PriceInputGroup>
              {fieldErrors?.cost_price && <Styled.FieldError>{fieldErrors.cost_price}</Styled.FieldError>}
            </Styled.PriceInputWrapper>

            <Styled.PlusIcon>+</Styled.PlusIcon>

            <Styled.PriceInputWrapper>
              <Styled.RowLabel>{FORM_LABELS.MARKUP}</Styled.RowLabel>
              <Styled.PriceInputGroup>
                <Styled.StyledInput
                  type="number"
                  step="0.01"
                  value={formData.markup}
                  onChange={handleMarkupChange}
                  placeholder="0"
                  disabled={isSubmitting}
                  $hasError={!!fieldErrors?.markup}
                />
                <Styled.PercentSymbol>%</Styled.PercentSymbol>
              </Styled.PriceInputGroup>
              {fieldErrors?.markup && <Styled.FieldError>{fieldErrors.markup}</Styled.FieldError>}
            </Styled.PriceInputWrapper>

            <Styled.EqualsIcon>=</Styled.EqualsIcon>

            <Styled.PriceInputWrapper>
              <Styled.RowLabel>{FORM_LABELS.TOTAL}</Styled.RowLabel>
              <Styled.PriceInputGroup>
                <Styled.StyledInput
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handlePriceChange}
                  placeholder="0"
                  disabled={isSubmitting}
                  $hasError={!!fieldErrors?.price}
                />
                <Styled.CurrencySymbol>₽</Styled.CurrencySymbol>
              </Styled.PriceInputGroup>
            </Styled.PriceInputWrapper>
          </Styled.PriceCalculation>
        </Styled.ModificationsGroup>
      </Styled.RowContent>
    </Styled.FormRow>
  </Styled.FormRows>
  )
}
