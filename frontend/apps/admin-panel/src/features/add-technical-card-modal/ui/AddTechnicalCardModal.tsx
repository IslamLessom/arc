import { useEffect, useRef } from 'react'
import { useAddTechnicalCardModal } from '../hooks/useAddTechnicalCardModal'
import type { AddTechnicalCardModalProps } from '../model/types'
import { Button, Input, ButtonSize, ButtonVariant } from '@restaurant-pos/ui'
import { Checkbox, Alert, Spin } from 'antd'
import { useGetCategories } from '@restaurant-pos/api-client'
import { translateUnit } from '../../../pages/technical-cards/lib/unitTranslator'
import * as Styled from './styled'

export const AddTechnicalCardModal = (props: AddTechnicalCardModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const firstFocusableRef = useRef<HTMLInputElement>(null)

    const { data: categories, isLoading: categoriesLoading } = useGetCategories()

    const {
        formData,
        isSubmitting,
        error,
        fieldErrors,
        isFormValid,
        markupLabel,
        costPriceLabel,
        ingredients,
        workshops,
        handleFieldChange,
        addIngredient,
        updateIngredient,
        removeIngredient,
        toggleComposition,
        handleSubmit,
        handleClose,
    } = useAddTechnicalCardModal(props)

    // Focus trap implementation
    useEffect(() => {
        if (!props.isOpen) return

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return

            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            if (!focusableElements || focusableElements.length === 0) return

            const firstElement = focusableElements[0] as HTMLElement
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus()
                    e.preventDefault()
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus()
                    e.preventDefault()
                }
            }
        }

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isSubmitting) {
                handleClose()
            }
        }

        document.addEventListener('keydown', handleTabKey)
        document.addEventListener('keydown', handleEscape)

        // Focus on first input when modal opens
        setTimeout(() => {
            firstFocusableRef.current?.focus()
        }, 100)

        return () => {
            document.removeEventListener('keydown', handleTabKey)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [props.isOpen, isSubmitting, handleClose])

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (props.isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [props.isOpen])

    if (!props.isOpen) {
        return null
    }

    return (
        <Styled.Overlay $isOpen={props.isOpen} onClick={handleClose} aria-hidden={!props.isOpen}>
            <Styled.ModalContainer
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <Styled.PageHeader>
                    <Styled.HeaderLeft>
                        <Styled.BackButton
                            type="button"
                            onClick={handleClose}
                            aria-label="Закрыть модальное окно"
                        >
                            ←
                        </Styled.BackButton>
                        <Styled.HeaderTitle id="modal-title">
                            {props.cardId ? 'Редактирование тех. карты' : 'Добавление тех. карты'}
                        </Styled.HeaderTitle>
                    </Styled.HeaderLeft>
                    <Styled.HeaderActions>
                        <Styled.PrintButton type="button" disabled={isSubmitting}>
                            <Styled.PrintIcon viewBox="0 0 20 20" aria-hidden="true">
                                <path
                                    d="M6 7V3h8v4M6 14H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2M6 12h8v5H6v-5Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                            </Styled.PrintIcon>
                            Распечатать
                        </Styled.PrintButton>
                    </Styled.HeaderActions>
                </Styled.PageHeader>

                <Styled.ModalBody>
                    {error && (
                        <Alert
                            message="Ошибка"
                            description={error}
                            type="error"
                            closable
                            style={{ marginBottom: '16px' }}
                        />
                    )}

                    <Styled.Form onSubmit={handleSubmit}>
                        <Styled.FormRows>
                            <Styled.FormRow>
                                <Styled.RowLabel>
                                    Название <Styled.Required>*</Styled.Required>
                                </Styled.RowLabel>
                                <Styled.RowContent>
                                    <Input
                                        ref={firstFocusableRef}
                                        value={formData.name}
                                        onChange={(e) => handleFieldChange('name', e.target.value)}
                                        placeholder="Введите название"
                                        disabled={isSubmitting}
                                    />
                                    {fieldErrors?.name && (
                                        <Styled.FieldError>{fieldErrors.name}</Styled.FieldError>
                                    )}
                                </Styled.RowContent>
                            </Styled.FormRow>

                            <Styled.FormRow>
                                <Styled.RowLabel>
                                    Категория <Styled.Required>*</Styled.Required>
                                </Styled.RowLabel>
                                <Styled.RowContent>
                                    {categoriesLoading ? (
                                        <Spin size="small" />
                                    ) : (
                                        <Styled.Select
                                            value={formData.category_id}
                                            onChange={(e) => handleFieldChange('category_id', e.target.value)}
                                            disabled={isSubmitting || categoriesLoading}
                                            $hasError={!!fieldErrors?.category_id}
                                        >
                                            <option value="">Выберите категорию</option>
                                            {categories?.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </Styled.Select>
                                    )}
                                    {fieldErrors?.category_id && (
                                        <Styled.FieldError>{fieldErrors.category_id}</Styled.FieldError>
                                    )}
                                </Styled.RowContent>
                            </Styled.FormRow>

                            <Styled.FormRow>
                                <Styled.RowLabel>Цех приготовления</Styled.RowLabel>
                                <Styled.RowContent>
                                    <Styled.Select
                                        value={formData.workshop_id}
                                        onChange={(e) => handleFieldChange('workshop_id', e.target.value)}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Без цеха</option>
                                        {workshops.map((workshop) => (
                                            <option key={workshop.id} value={workshop.id}>
                                                {workshop.name}
                                            </option>
                                        ))}
                                    </Styled.Select>
                                    <Styled.RowHint>
                                        Выберите цех, чтобы печатать на него бегунки и правильно{' '}
                                        <Styled.HintLink>списывать ингредиенты</Styled.HintLink> с разных складов
                                    </Styled.RowHint>
                                </Styled.RowContent>
                            </Styled.FormRow>

                            <Styled.FormRow>
                                <Styled.RowLabel>Обложка</Styled.RowLabel>
                                <Styled.RowContent>
                                    <Styled.CoverPreview />
                                </Styled.RowContent>
                            </Styled.FormRow>

                            <Styled.FormRow>
                                <Styled.RowLabel>Опции</Styled.RowLabel>
                                <Styled.RowContent>
                                    <Styled.OptionsList>
                                        <Checkbox
                                            checked={formData.is_weighted}
                                            onChange={(e) => handleFieldChange('is_weighted', e.target.checked)}
                                            disabled={isSubmitting}
                                        >
                                            Весовая тех. карта
                                        </Checkbox>
                                        <Checkbox
                                            checked={formData.is_discount_disabled}
                                            onChange={(e) =>
                                                handleFieldChange('is_discount_disabled', e.target.checked)
                                            }
                                            disabled={isSubmitting}
                                        >
                                            Не участвует в скидках
                                        </Checkbox>
                                    </Styled.OptionsList>
                                </Styled.RowContent>
                            </Styled.FormRow>

                            <Styled.FormRow>
                                <Styled.RowLabel>Цена</Styled.RowLabel>
                                <Styled.RowContent>
                                    <Styled.PriceRow>
                                        <Styled.PriceInputGroup>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.price}
                                                onChange={(e) =>
                                                    handleFieldChange('price', parseFloat(e.target.value) || 0)
                                                }
                                                disabled={isSubmitting}
                                            />
                                            <Styled.UnitLabel>₽</Styled.UnitLabel>
                                        </Styled.PriceInputGroup>
                                        {fieldErrors?.price && (
                                            <Styled.FieldError>{fieldErrors.price}</Styled.FieldError>
                                        )}
                                        <Styled.InfoGroup>
                                            <Styled.InfoItem>
                                                <Styled.InfoLabel>
                                                    Наценка до налога <Styled.InfoIcon>?</Styled.InfoIcon>
                                                </Styled.InfoLabel>
                                                <Styled.InfoValue>{markupLabel}</Styled.InfoValue>
                                            </Styled.InfoItem>
                                            <Styled.InfoItem>
                                                <Styled.InfoLabel>
                                                    Себестоимость без НДС <Styled.InfoIcon>?</Styled.InfoIcon>
                                                </Styled.InfoLabel>
                                                <Styled.InfoValue>{costPriceLabel}</Styled.InfoValue>
                                            </Styled.InfoItem>
                                        </Styled.InfoGroup>
                                    </Styled.PriceRow>
                                </Styled.RowContent>
                            </Styled.FormRow>
                        </Styled.FormRows>

                        <Styled.AdditionalToggle
                            type="button"
                            onClick={toggleComposition}
                            aria-expanded={formData.showComposition}
                        >
                            Дополнительно
                            <Styled.Chevron $isOpen={formData.showComposition} />
                        </Styled.AdditionalToggle>

                        {formData.showComposition && (
                            <Styled.AdditionalSection>
                                <Styled.SectionHeader>
                                    <Styled.SectionTitle>Состав</Styled.SectionTitle>
                                    <Styled.SectionDescription>
                                        Ингредиенты и полуфабрикаты, из которых состоит тех. карта
                                    </Styled.SectionDescription>
                                </Styled.SectionHeader>

                                <Styled.IngredientsTable>
                                    <Styled.TableHeader>
                                        <div>Продукты</div>
                                        <div>Брутто</div>
                                        <div>Нетто</div>
                                        <div>
                                            Себестоимость
                                            <Styled.HelpIcon title="Себестоимость рассчитывается автоматически">?</Styled.HelpIcon>
                                        </div>
                                        <div></div>
                                    </Styled.TableHeader>

                                    {formData.ingredients.map((ingredient) => (
                                        <Styled.TableRow key={ingredient.id}>
                                            <div>
                                                <Styled.TableSelect
                                                    value={ingredient.ingredient_id || ''}
                                                    onChange={(e) => {
                                                        updateIngredient(ingredient.id, { ingredient_id: e.target.value })
                                                    }}
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Выберите продукт</option>
                                                    {ingredients.map((ing) => (
                                                        <option key={ing.id} value={ing.id}>
                                                            {ing.name}
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
                                                        updateIngredient(ingredient.id, { gross: value, net: value })
                                                    }}
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.01"
                                                    disabled={isSubmitting}
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
                                                        disabled={isSubmitting}
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
                                                <Styled.DeleteButton
                                                    onClick={() => removeIngredient(ingredient.id)}
                                                    disabled={isSubmitting}
                                                >
                                                    ×
                                                </Styled.DeleteButton>
                                            </div>
                                        </Styled.TableRow>
                                    ))}

                                    <Styled.AddIngredientButton
                                        type="button"
                                        onClick={addIngredient}
                                        disabled={isSubmitting}
                                    >
                                        <span>+</span>
                                        Добавить ингредиент
                                    </Styled.AddIngredientButton>
                                </Styled.IngredientsTable>

                                {/* <Styled.ModifierHeaderRow>
                                    <Styled.SectionHeader>
                                        <Styled.SectionTitle>Модификаторы</Styled.SectionTitle>
                                        <Styled.SectionDescription>
                                            Выбор среди разновидностей или возможность добавить дополнительные ингредиенты
                                        </Styled.SectionDescription>
                                    </Styled.SectionHeader>
                                    <Styled.ModifierBanner>
                                        Модификаторы доступны только в тарифах Business и Pro
                                    </Styled.ModifierBanner>
                                </Styled.ModifierHeaderRow>
                                <Styled.ModifierButton type="button" disabled>
                                    + Добавить набор модификаторов... */}
                                {/* </Styled.ModifierButton> */}
                            </Styled.AdditionalSection>
                        )}
                    </Styled.Form>
                </Styled.ModalBody>

                <Styled.ModalFooter>
                    <Styled.FooterActions>
                        <Button
                            htmlType="button"
                            size={ButtonSize.Large}
                            variant={ButtonVariant.Outline}
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </Button>
                        <Button
                            htmlType="submit"
                            size={ButtonSize.Large}
                            variant={ButtonVariant.Default}
                            onClick={handleSubmit}
                            disabled={!isFormValid || isSubmitting}
                        >
                            {isSubmitting
                                ? 'Сохранение...'
                                : props.cardId
                                    ? 'Сохранить изменения'
                                    : 'Сохранить'}
                        </Button>
                    </Styled.FooterActions>
                </Styled.ModalFooter>
            </Styled.ModalContainer>
        </Styled.Overlay>
    )
}

