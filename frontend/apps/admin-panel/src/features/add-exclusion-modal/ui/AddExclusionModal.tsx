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
    isLoadingTechCards,
    isLoadingTechCardCategories,
    products,
    categories,
    techCards,
    techCardCategories,
    handleFieldChange,
    toggleProduct,
    toggleCategory,
    toggleTechCard,
    toggleTechCardCategory,
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

  const getPlaceholder = () => {
    switch (formData.type) {
      case 'product':
        return 'Поиск по названию товара или категории'
      case 'category':
        return 'Поиск по названию категории'
      case 'tech_card':
        return 'Поиск по названию тех-карты или категории'
      case 'tech_card_category':
        return 'Поиск по названию категории'
      default:
        return 'Поиск...'
    }
  }

  const getSelectionLabel = () => {
    switch (formData.type) {
      case 'product':
        return 'Выберите товары'
      case 'category':
        return 'Выберите категории'
      case 'tech_card':
        return 'Выберите тех-карты'
      case 'tech_card_category':
        return 'Выберите категории'
      default:
        return 'Выберите элементы'
    }
  }

  const getSelectedCount = () => {
    switch (formData.type) {
      case 'product':
        return formData.selectedProducts.length
      case 'category':
        return formData.selectedCategories.length
      case 'tech_card':
        return formData.selectedTechCards.length
      case 'tech_card_category':
        return formData.selectedTechCardCategories.length
      default:
        return 0
    }
  }

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
                        Категории товаров
                      </Styled.TypeButton>
                      <Styled.TypeButton
                        type="button"
                        $active={formData.type === 'tech_card'}
                        onClick={() => handleFieldChange('type', 'tech_card')}
                      >
                        Тех-карты
                      </Styled.TypeButton>
                      <Styled.TypeButton
                        type="button"
                        $active={formData.type === 'tech_card_category'}
                        onClick={() => handleFieldChange('type', 'tech_card_category')}
                      >
                        Категории тех-карт
                      </Styled.TypeButton>
                    </Styled.TypeToggle>
                  </Styled.FormRow>

                  <Styled.FormRow>
                    <Styled.RowLabel>Поиск</Styled.RowLabel>
                    <Styled.SearchInput
                      value={formData.searchQuery}
                      onChange={(e) => handleFieldChange('searchQuery', e.target.value)}
                      placeholder={getPlaceholder()}
                    />
                  </Styled.FormRow>

                  <Styled.FormRow>
                    <Styled.RowLabel>
                      {getSelectionLabel()} <Styled.Required>*</Styled.Required>
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
                      ) : formData.type === 'category' ? (
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
                      ) : formData.type === 'tech_card' ? (
                        isLoadingTechCards ? (
                          <Styled.LoadingText>Загрузка тех-карт...</Styled.LoadingText>
                        ) : techCards.length === 0 ? (
                          <Styled.EmptyText>Нет тех-карт</Styled.EmptyText>
                        ) : (
                          techCards.map((techCard) => (
                            <Styled.SelectionItem key={techCard.id}>
                              <Styled.Checkbox
                                type="checkbox"
                                checked={formData.selectedTechCards.includes(techCard.id)}
                                onChange={() => toggleTechCard(techCard.id)}
                              />
                              <Styled.ItemInfo>
                                <Styled.ItemName>{techCard.name}</Styled.ItemName>
                                {techCard.category_name && (
                                  <Styled.ItemSubtext>{techCard.category_name}</Styled.ItemSubtext>
                                )}
                              </Styled.ItemInfo>
                              <Styled.ItemPrice>{techCard.price} ₽</Styled.ItemPrice>
                            </Styled.SelectionItem>
                          ))
                        )
                      ) : formData.type === 'tech_card_category' ? (
                        isLoadingTechCardCategories ? (
                          <Styled.LoadingText>Загрузка категорий...</Styled.LoadingText>
                        ) : techCardCategories.length === 0 ? (
                          <Styled.EmptyText>Нет категорий</Styled.EmptyText>
                        ) : (
                          techCardCategories.map((category) => (
                            <Styled.SelectionItem key={category.id}>
                              <Styled.Checkbox
                                type="checkbox"
                                checked={formData.selectedTechCardCategories.includes(category.id)}
                                onChange={() => toggleTechCardCategory(category.id)}
                              />
                              <Styled.ItemInfo>
                                <Styled.ItemName>{category.name}</Styled.ItemName>
                              </Styled.ItemInfo>
                            </Styled.SelectionItem>
                          ))
                        )
                      ) : null}
                    </Styled.SelectionList>

                    <Styled.SelectionInfo>
                      Выбрано: {getSelectedCount()}
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
