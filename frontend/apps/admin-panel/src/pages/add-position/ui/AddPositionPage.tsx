import { useAddPositionPage } from '../hooks/useAddPositionPage'
import { getPositionName, POSITION_NAMES } from '../../positions/lib/positionNameMap'
import * as Styled from './styled'

export const AddPositionPage = () => {
  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    isLoadingPosition,
    isEditMode,
    existingPositions,
    handleFieldChange,
    handleNestedFieldChange,
    handleAdminPanelAccessChange,
    handleSubmit,
    handleBack,
  } = useAddPositionPage()

  // Добавим лог для отладки
  console.log('AddPositionPage render:', { isLoadingPosition, isEditMode, formData })

  if (isLoadingPosition) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>{isEditMode ? 'Загрузка должности...' : 'Загрузка...'}</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>
            {isEditMode ? 'Редактирование должности' : 'Добавление должности'}
          </Styled.Title>
        </Styled.HeaderLeft>
      </Styled.Header>

      <Styled.FormContainer>
        {error && (
          <Styled.ErrorMessage>{error}</Styled.ErrorMessage>
        )}

        <Styled.Form onSubmit={handleSubmit}>
          <Styled.FormSection>
            <Styled.SectionTitle>Основная информация</Styled.SectionTitle>

            <Styled.FormRow>
              <Styled.RowLabel>
                Название должности <Styled.Required>*</Styled.Required>
              </Styled.RowLabel>
              <Styled.RowContent>
                <Styled.StyledInput
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Введите название должности (например, cashier, cook)"
                  disabled={isSubmitting || isEditMode}
                  $hasError={!!fieldErrors?.name}
                />
                {isEditMode && POSITION_NAMES[formData.name] && (
                  <Styled.RowHint>
                    Отображаемое название: <strong>{getPositionName(formData.name)}</strong>
                  </Styled.RowHint>
                )}
                {fieldErrors?.name && (
                  <Styled.FieldError>{fieldErrors.name}</Styled.FieldError>
                )}
                {!isEditMode && existingPositions.length > 0 && (
                  <Styled.HelpText>
                    Занятые имена: {existingPositions.map(p => p.name).sort().join(', ')}
                  </Styled.HelpText>
                )}
                {!isEditMode && (
                  <Styled.HelpText>
                    Используйте уникальное английское название для идентификации
                  </Styled.HelpText>
                )}
              </Styled.RowContent>
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
                <Styled.HelpIcon title="Администрирование зала — доступ к управлению залом">?</Styled.HelpIcon>
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
                {formData.adminPanelSections.map((section) => (
                  <Styled.AccessTableRow key={section.id}>
                    <Styled.AccessTableCell>
                      {section.name}
                    </Styled.AccessTableCell>
                    <Styled.AccessTableCell>
                      <Styled.RadioLabel>
                        <Styled.StyledRadio
                          type="radio"
                          name={`access-${section.id}`}
                          checked={formData.adminPanelAccess[section.id] === 'none'}
                          onChange={() => handleAdminPanelAccessChange(section.id, 'none')}
                          disabled={isSubmitting}
                        />
                      </Styled.RadioLabel>
                    </Styled.AccessTableCell>
                    <Styled.AccessTableCell>
                      <Styled.RadioLabel>
                        <Styled.StyledRadio
                          type="radio"
                          name={`access-${section.id}`}
                          checked={formData.adminPanelAccess[section.id] === 'view'}
                          onChange={() => handleAdminPanelAccessChange(section.id, 'view')}
                          disabled={isSubmitting}
                        />
                      </Styled.RadioLabel>
                    </Styled.AccessTableCell>
                    <Styled.AccessTableCell>
                      <Styled.RadioLabel>
                        <Styled.StyledRadio
                          type="radio"
                          name={`access-${section.id}`}
                          checked={formData.adminPanelAccess[section.id] === 'full'}
                          onChange={() => handleAdminPanelAccessChange(section.id, 'full')}
                          disabled={isSubmitting}
                        />
                      </Styled.RadioLabel>
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
                <Styled.HelpIcon title="Подтверждение установки приложений сотрудником">?</Styled.HelpIcon>
              </Styled.CheckboxLabel>
            </Styled.CheckboxWrapper>
          </Styled.FormSection>

          <Styled.FormSection>
            <Styled.SectionTitle>Расчет зарплаты</Styled.SectionTitle>
            <Styled.SectionDescription>
              Выберите один или несколько способов расчёта зарплаты для должности. Суммы к выплате сотрудникам будут во вкладке{' '}
              <Styled.Link href="#">Финансы</Styled.Link> →{' '}
              <Styled.Link href="#">Зарплата</Styled.Link>.
            </Styled.SectionDescription>

            <Styled.SalarySection>
              <Styled.SalarySectionTitle>
                Фиксированная ставка
                <Styled.HelpIcon title="Оплата за час/смену/месяц">?</Styled.HelpIcon>
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
                <Styled.HelpIcon title="Процент от личных продаж сотрудника">?</Styled.HelpIcon>
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
                  {formData.salaryCategories.map((category) => (
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
                <Styled.HelpIcon title="Процент от продаж за смену">?</Styled.HelpIcon>
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
                  {formData.salaryCategories.map((category) => (
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

          <Styled.FormActions>
            <Styled.CancelButton type="button" onClick={handleBack} disabled={isSubmitting}>
              Отмена
            </Styled.CancelButton>
            <Styled.SaveButton
              type="submit"
              disabled={!isFormValid || isSubmitting}
              $disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : isEditMode ? 'Сохранить изменения' : 'Сохранить'}
            </Styled.SaveButton>
          </Styled.FormActions>
        </Styled.Form>
      </Styled.FormContainer>
    </Styled.PageContainer>
  )
}
