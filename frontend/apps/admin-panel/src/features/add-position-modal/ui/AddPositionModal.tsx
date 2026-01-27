import { useEffect, useRef } from 'react'
import { Alert } from 'antd'
import { Button, ButtonSize, ButtonVariant } from '@restaurant-pos/ui'
import { useAddPositionModal } from '../hooks/useAddPositionModal'
import type { AddPositionModalProps } from '../model/types'
import { ADMIN_PANEL_SECTIONS, SALARY_CATEGORIES, type SalaryCategory } from '../model/types'
import { HELP_TOOLTIPS, ADMIN_PANEL_SECTION_LABELS } from '../lib/constants'
import { getPositionName, POSITION_NAMES } from '../../../pages/positions/lib/positionNameMap'
import * as Styled from './styled'

export const AddPositionModal = (props: AddPositionModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLInputElement>(null)

  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    handleFieldChange,
    handleNestedFieldChange,
    handleAdminPanelAccessChange,
    handleSubmit,
    handleClose,
  } = useAddPositionModal(props)

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

    setTimeout(() => {
      firstFocusableRef.current?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleTabKey)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [props.isOpen, isSubmitting, handleClose])

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
              disabled={isSubmitting}
            >
              ←
            </Styled.BackButton>
            <Styled.HeaderTitle id="modal-title">
              {props.positionId ? 'Редактирование должности' : 'Добавление должности'}
            </Styled.HeaderTitle>
          </Styled.HeaderLeft>
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
            <Styled.FormSection>
              <Styled.FormRow>
                <Styled.RowLabel>
                  Название должности <Styled.Required>*</Styled.Required>
                </Styled.RowLabel>
                <Styled.StyledInput
                  ref={firstFocusableRef}
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Введите название должности (например, cashier, cook)"
                  disabled={isSubmitting || !!props.positionId}
                  $hasError={!!fieldErrors?.name}
                />
                {props.positionId && POSITION_NAMES[formData.name] && (
                  <Styled.RowHint>
                    Отображаемое название: <strong>{getPositionName(formData.name)}</strong>
                  </Styled.RowHint>
                )}
                {fieldErrors?.name && (
                  <Styled.FieldError>{fieldErrors.name}</Styled.FieldError>
                )}
              </Styled.FormRow>
            </Styled.FormSection>

            <Styled.FormSection>
              <Styled.SectionTitle>Доступ к кассе</Styled.SectionTitle>
              <Styled.CheckboxWrapper>
                <Styled.CheckboxLabel>
                  <Styled.StyledCheckbox
                    type="checkbox"
                    checked={formData.cashAccess.workWithCash}
                    onChange={(e) =>
                      handleNestedFieldChange('cashAccess', 'workWithCash', e.target.checked)
                    }
                    disabled={isSubmitting}
                  />
                  работа с кассой
                </Styled.CheckboxLabel>
              </Styled.CheckboxWrapper>
              <Styled.CheckboxWrapper>
                <Styled.CheckboxLabel>
                  <Styled.StyledCheckbox
                    type="checkbox"
                    checked={formData.cashAccess.adminHall}
                    onChange={(e) =>
                      handleNestedFieldChange('cashAccess', 'adminHall', e.target.checked)
                    }
                    disabled={isSubmitting}
                  />
                  администрирование зала
                  <Styled.HelpIcon title={HELP_TOOLTIPS.adminHall}>?</Styled.HelpIcon>
                </Styled.CheckboxLabel>
              </Styled.CheckboxWrapper>
            </Styled.FormSection>

            <Styled.FormSection>
              <Styled.SectionTitle>Доступ к админ-панели</Styled.SectionTitle>
              <Styled.AccessTable>
                <Styled.AccessTableHead>
                  <Styled.AccessTableRow>
                    <Styled.AccessTableHeaderCell>Разделы</Styled.AccessTableHeaderCell>
                    <Styled.AccessTableHeaderCell>Без доступа</Styled.AccessTableHeaderCell>
                    <Styled.AccessTableHeaderCell>Просмотр</Styled.AccessTableHeaderCell>
                    <Styled.AccessTableHeaderCell>Полный доступ</Styled.AccessTableHeaderCell>
                  </Styled.AccessTableRow>
                </Styled.AccessTableHead>
                <tbody>
                  {ADMIN_PANEL_SECTIONS.map((section) => (
                    <Styled.AccessTableRow key={section.id}>
                      <Styled.AccessTableCell>
                        {ADMIN_PANEL_SECTION_LABELS[section.id]}
                      </Styled.AccessTableCell>
                      <Styled.AccessTableCell>
                        <Styled.RadioGroup>
                          <Styled.RadioLabel>
                            <Styled.StyledRadio
                              type="radio"
                              name={`access-${section.id}`}
                              checked={formData.adminPanelAccess[section.id] === 'none'}
                              onChange={() => handleAdminPanelAccessChange(section.id, 'none')}
                              disabled={isSubmitting}
                            />
                          </Styled.RadioLabel>
                        </Styled.RadioGroup>
                      </Styled.AccessTableCell>
                      <Styled.AccessTableCell>
                        <Styled.RadioGroup>
                          <Styled.RadioLabel>
                            <Styled.StyledRadio
                              type="radio"
                              name={`access-${section.id}`}
                              checked={formData.adminPanelAccess[section.id] === 'view'}
                              onChange={() => handleAdminPanelAccessChange(section.id, 'view')}
                              disabled={isSubmitting}
                            />
                          </Styled.RadioLabel>
                        </Styled.RadioGroup>
                      </Styled.AccessTableCell>
                      <Styled.AccessTableCell>
                        <Styled.RadioGroup>
                          <Styled.RadioLabel>
                            <Styled.StyledRadio
                              type="radio"
                              name={`access-${section.id}`}
                              checked={formData.adminPanelAccess[section.id] === 'full'}
                              onChange={() => handleAdminPanelAccessChange(section.id, 'full')}
                              disabled={isSubmitting}
                            />
                          </Styled.RadioLabel>
                        </Styled.RadioGroup>
                      </Styled.AccessTableCell>
                    </Styled.AccessTableRow>
                  ))}
                </tbody>
              </Styled.AccessTable>
            </Styled.FormSection>

            <Styled.FormSection>
              <Styled.SectionTitle>Доступ к приложениям</Styled.SectionTitle>
              <Styled.CheckboxWrapper>
                <Styled.CheckboxLabel>
                  <Styled.StyledCheckbox
                    type="checkbox"
                    checked={formData.applicationsAccess.confirmInstallation}
                    onChange={(e) =>
                      handleNestedFieldChange(
                        'applicationsAccess',
                        'confirmInstallation',
                        e.target.checked
                      )
                    }
                    disabled={isSubmitting}
                  />
                  подтверждение установки приложений
                  <Styled.HelpIcon title={HELP_TOOLTIPS.confirmInstallation}>?</Styled.HelpIcon>
                </Styled.CheckboxLabel>
              </Styled.CheckboxWrapper>
            </Styled.FormSection>

            <Styled.FormSection>
              <Styled.SectionTitle>Расчет зарплаты</Styled.SectionTitle>
              <Styled.SectionDescription>
                Выберите один или несколько способов расчёта зарплаты для должности. Суммы к выплате
                сотрудникам будут во вкладке{' '}
                <Styled.Link href="#">Финансы</Styled.Link> →{' '}
                <Styled.Link href="#">Зарплата</Styled.Link>.
              </Styled.SectionDescription>

              <Styled.SalarySection>
                <Styled.SalarySectionTitle>
                  Фиксированная ставка
                  <Styled.HelpIcon title={HELP_TOOLTIPS.perHour}>?</Styled.HelpIcon>
                </Styled.SalarySectionTitle>
                <Styled.FixedRateInputs>
                  <Styled.RateInputGroup>
                    <Styled.RateInput
                      value={formData.salaryCalculation.fixedRate.perHour}
                      onChange={(e) =>
                        handleNestedFieldChange(
                          'salaryCalculation',
                          'fixedRate',
                          {
                            ...formData.salaryCalculation.fixedRate,
                            perHour: e.target.value,
                          }
                        )
                      }
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                    <Styled.RateLabel>За час</Styled.RateLabel>
                  </Styled.RateInputGroup>
                  <Styled.RateSeparator>+</Styled.RateSeparator>
                  <Styled.RateInputGroup>
                    <Styled.RateInput
                      value={formData.salaryCalculation.fixedRate.perShift}
                      onChange={(e) =>
                        handleNestedFieldChange(
                          'salaryCalculation',
                          'fixedRate',
                          {
                            ...formData.salaryCalculation.fixedRate,
                            perShift: e.target.value,
                          }
                        )
                      }
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                    <Styled.RateLabel>За смену</Styled.RateLabel>
                  </Styled.RateInputGroup>
                  <Styled.RateSeparator>+</Styled.RateSeparator>
                  <Styled.RateInputGroup>
                    <Styled.RateInput
                      value={formData.salaryCalculation.fixedRate.perMonth}
                      onChange={(e) =>
                        handleNestedFieldChange(
                          'salaryCalculation',
                          'fixedRate',
                          {
                            ...formData.salaryCalculation.fixedRate,
                            perMonth: e.target.value,
                          }
                        )
                      }
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                    <Styled.RateLabel>За месяц</Styled.RateLabel>
                  </Styled.RateInputGroup>
                </Styled.FixedRateInputs>
              </Styled.SalarySection>

              <Styled.SalarySection>
                <Styled.SalarySectionTitle>
                  Процент от личных продаж
                  <Styled.HelpIcon title={HELP_TOOLTIPS.personalSales}>?</Styled.HelpIcon>
                </Styled.SalarySectionTitle>
                <Styled.SalesPercentageRow>
                  <Styled.CategorySelect
                    value={formData.salaryCalculation.personalSalesPercentage.categoryId}
                    onChange={(e) =>
                      handleNestedFieldChange(
                        'salaryCalculation',
                        'personalSalesPercentage',
                        {
                          ...formData.salaryCalculation.personalSalesPercentage,
                          categoryId: e.target.value,
                        }
                      )
                    }
                    disabled={isSubmitting}
                  >
                    {SALARY_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Styled.CategorySelect>
                  <Styled.PercentageWrapper>
                    <Styled.PercentageInput
                      value={formData.salaryCalculation.personalSalesPercentage.percentage}
                      onChange={(e) =>
                        handleNestedFieldChange(
                          'salaryCalculation',
                          'personalSalesPercentage',
                          {
                            ...formData.salaryCalculation.personalSalesPercentage,
                            percentage: e.target.value,
                          }
                        )
                      }
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                    <Styled.PercentageSuffix>%</Styled.PercentageSuffix>
                  </Styled.PercentageWrapper>
                </Styled.SalesPercentageRow>
              </Styled.SalarySection>

              <Styled.SalarySection>
                <Styled.SalarySectionTitle>
                  Процент от продаж за смену
                  <Styled.HelpIcon title={HELP_TOOLTIPS.shiftSales}>?</Styled.HelpIcon>
                </Styled.SalarySectionTitle>
                <Styled.SalesPercentageRow>
                  <Styled.CategorySelect
                    value={formData.salaryCalculation.shiftSalesPercentage.categoryId}
                    onChange={(e) =>
                      handleNestedFieldChange(
                        'salaryCalculation',
                        'shiftSalesPercentage',
                        {
                          ...formData.salaryCalculation.shiftSalesPercentage,
                          categoryId: e.target.value,
                        }
                      )
                    }
                    disabled={isSubmitting}
                  >
                    {SALARY_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Styled.CategorySelect>
                  <Styled.PercentageWrapper>
                    <Styled.PercentageInput
                      value={formData.salaryCalculation.shiftSalesPercentage.percentage}
                      onChange={(e) =>
                        handleNestedFieldChange(
                          'salaryCalculation',
                          'shiftSalesPercentage',
                          {
                            ...formData.salaryCalculation.shiftSalesPercentage,
                            percentage: e.target.value,
                          }
                        )
                      }
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                    <Styled.PercentageSuffix>%</Styled.PercentageSuffix>
                  </Styled.PercentageWrapper>
                </Styled.SalesPercentageRow>
              </Styled.SalarySection>

              <Styled.AddCategoryLink>+ Добавить категорию</Styled.AddCategoryLink>
            </Styled.FormSection>

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
                <Styled.SaveButton
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  $disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting
                    ? 'Сохранение...'
                    : props.positionId
                    ? 'Сохранить изменения'
                    : 'Сохранить'}
                </Styled.SaveButton>
              </Styled.FooterActions>
            </Styled.ModalFooter>
          </Styled.Form>
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}
