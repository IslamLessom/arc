import { useEffect, useRef } from 'react'
import { Alert } from 'antd'
import { useAddExclusionModal } from '../hooks/useAddExclusionModal'
import type { AddExclusionModalProps } from '../model/types'
import * as Styled from './styled'

export const AddExclusionModal = (props: AddExclusionModalProps) => {
  const firstInputRef = useRef<HTMLInputElement>(null)

  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    isLoadingProducts,
    isLoadingCategories,
    products,
    categories,
    handleFieldChange,
    toggleProduct,
    toggleCategory,
    handleSubmit,
    handleClose,
  } = useAddExclusionModal(props)

  useEffect(() => {
    if (!props.isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setTimeout(() => firstInputRef.current?.focus(), 50)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) handleClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [props.isOpen, isSubmitting, handleClose])

  if (!props.isOpen) return null

  return (
    <Styled.Overlay $isOpen={props.isOpen} onClick={handleClose}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.PageHeader>
          <Styled.HeaderLeft>
            <Styled.BackButton type="button" onClick={handleClose}>←</Styled.BackButton>
            <Styled.HeaderTitle>
              {props.exclusionId ? 'Редактирование исключения' : 'Добавление исключения'}
            </Styled.HeaderTitle>
          </Styled.HeaderLeft>
        </Styled.PageHeader>

        <Styled.ModalBody>
          {error && <Alert type="error" message="Ошибка" description={error} style={{ marginBottom: 12 }} />}

          <Styled.Form onSubmit={handleSubmit}>
            <Styled.FormRows>
              <Styled.FormRow>
                <Styled.RowLabel>Название <Styled.Required>*</Styled.Required></Styled.RowLabel>
                <Styled.StyledInput
                  ref={firstInputRef}
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  $hasError={!!fieldErrors.name}
                  placeholder="Например: Скидки на праздничные товары"
                />
                {fieldErrors.name && <Styled.FieldError>{fieldErrors.name}</Styled.FieldError>}
              </Styled.FormRow>

              <Styled.FormRow>
                <Styled.RowLabel>Описание</Styled.RowLabel>
                <Styled.StyledTextarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Опишите исключение (необязательно)"
                />
              </Styled.FormRow>

              {!props.exclusionId && (
                <>
                  <Styled.FormRow>
                    <Styled.RowLabel>Тип исключения</Styled.RowLabel>
                    <Styled.TypeToggle>
                      <Styled.TypeButton
                        type="button"
                        $active={formData.type === 'product'}
                        onClick={() => handleFieldChange('type', 'product')}
                      >
                        Товары
                      </Styled.TypeButton>
                      <Styled.TypeButton
                        type="button"
                        $active={formData.type === 'category'}
                        onClick={() => handleFieldChange('type', 'category')}
                      >
                        Категории
                      </Styled.TypeButton>
                    </Styled.TypeToggle>
                  </Styled.FormRow>

                  <Styled.FormRow>
                    <Styled.RowLabel>Поиск</Styled.RowLabel>
                    <Styled.SearchInput
                      value={formData.searchQuery}
                      onChange={(e) => handleFieldChange('searchQuery', e.target.value)}
                      placeholder={formData.type === 'product' ? 'Поиск по названию товара или категории' : 'Поиск по названию категории'}
                    />
                  </Styled.FormRow>

                  <Styled.FormRow>
                    <Styled.RowLabel>
                      {formData.type === 'product' ? 'Выберите товары' : 'Выберите категории'} <Styled.Required>*</Styled.Required>
                    </Styled.RowLabel>
                    {fieldErrors.selection && <Styled.FieldError>{fieldErrors.selection}</Styled.FieldError>}

                    <Styled.SelectionList>
                      {formData.type === 'product' ? (
                        isLoadingProducts ? (
                          <Styled.LoadingText>Загрузка товаров...</Styled.LoadingText>
                        ) : products.length === 0 ? (
                          <Styled.EmptyText>Нет товаров</Styled.EmptyText>
                        ) : (
                          products.map((product) => (
                            <Styled.SelectionItem key={product.id}>
                              <Styled.Checkbox
                                type="checkbox"
                                checked={formData.selectedProducts.includes(product.id)}
                                onChange={() => toggleProduct(product.id)}
                              />
                              <Styled.ItemInfo>
                                <Styled.ItemName>{product.name}</Styled.ItemName>
                                {product.category_name && (
                                  <Styled.ItemSubtext>{product.category_name}</Styled.ItemSubtext>
                                )}
                              </Styled.ItemInfo>
                              <Styled.ItemPrice>{product.price} ₽</Styled.ItemPrice>
                            </Styled.SelectionItem>
                          ))
                        )
                      ) : (
                        isLoadingCategories ? (
                          <Styled.LoadingText>Загрузка категорий...</Styled.LoadingText>
                        ) : categories.length === 0 ? (
                          <Styled.EmptyText>Нет категорий</Styled.EmptyText>
                        ) : (
                          categories.map((category) => (
                            <Styled.SelectionItem key={category.id}>
                              <Styled.Checkbox
                                type="checkbox"
                                checked={formData.selectedCategories.includes(category.id)}
                                onChange={() => toggleCategory(category.id)}
                              />
                              <Styled.ItemInfo>
                                <Styled.ItemName>{category.name}</Styled.ItemName>
                              </Styled.ItemInfo>
                            </Styled.SelectionItem>
                          ))
                        )
                      )}
                    </Styled.SelectionList>

                    <Styled.SelectionInfo>
                      Выбрано: {formData.type === 'product'
                        ? formData.selectedProducts.length
                        : formData.selectedCategories.length}
                    </Styled.SelectionInfo>
                  </Styled.FormRow>
                </>
              )}

              {props.exclusionId && (
                <Styled.CheckboxRow>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleFieldChange('active', e.target.checked)}
                  />
                  Активное исключение
                </Styled.CheckboxRow>
              )}
            </Styled.FormRows>

            <Styled.ModalFooter>
              <Styled.CancelButton type="button" onClick={handleClose} disabled={isSubmitting}>Отмена</Styled.CancelButton>
              <Styled.SaveButton type="submit" $disabled={!isFormValid || isSubmitting} disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? 'Сохранение...' : props.exclusionId ? 'Сохранить' : 'Добавить'}
              </Styled.SaveButton>
            </Styled.ModalFooter>
          </Styled.Form>
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}
