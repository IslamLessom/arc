import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetPosition, useCreatePosition, useUpdatePosition, useGetPositions } from '@restaurant-pos/api-client'
import type { AddPositionFormData, FieldErrors, AccessLevel, SalaryPercentageRule } from '../model/types'
import { ADMIN_PANEL_SECTIONS, SALARY_CATEGORIES, DEFAULT_ADMIN_PANEL_ACCESS } from '../model/types'

const DEFAULT_SALARY_RULE: SalaryPercentageRule = {
  categoryId: 'all',
  percentage: '0',
}

const formatFormDataToPermissions = (formData: AddPositionFormData): string => {
  const personalSalesPercentages = formData.salaryCalculation.personalSalesPercentages
    .filter((rule) => (rule.percentage || '').trim() !== '' && Number(rule.percentage || 0) > 0)
    .map((rule) => ({
      ...(rule.categoryId && rule.categoryId !== 'all' && { category_id: rule.categoryId }),
      percentage: parseFloat(rule.percentage || '0'),
    }))

  const shiftSalesPercentages = formData.salaryCalculation.shiftSalesPercentages
    .filter((rule) => (rule.percentage || '').trim() !== '' && Number(rule.percentage || 0) > 0)
    .map((rule) => ({
      ...(rule.categoryId && rule.categoryId !== 'all' && { category_id: rule.categoryId }),
      percentage: parseFloat(rule.percentage || '0'),
    }))

  const permissions = {
    cash_access: {
      work_with_cash: formData.cashAccess.workWithCash,
      admin_hall: formData.cashAccess.adminHall,
    },
    admin_panel_access: {
      sections: Object.entries(formData.adminPanelAccess).map(([section, access]) => ({
        section,
        access_level: access,
      })),
    },
    applications_access: {
      confirm_installation: formData.applicationsAccess.confirmInstallation,
    },
    salary_calculation: {
      ...(formData.salaryCalculation.fixedRate.perHour ||
        formData.salaryCalculation.fixedRate.perShift ||
        formData.salaryCalculation.fixedRate.perMonth
        ? {
            fixed_rate: {
              ...(formData.salaryCalculation.fixedRate.perHour && {
                per_hour: parseFloat(formData.salaryCalculation.fixedRate.perHour),
              }),
              ...(formData.salaryCalculation.fixedRate.perShift && {
                per_shift: parseFloat(formData.salaryCalculation.fixedRate.perShift),
              }),
              ...(formData.salaryCalculation.fixedRate.perMonth && {
                per_month: parseFloat(formData.salaryCalculation.fixedRate.perMonth),
              }),
            },
          }
        : {}),
      ...(personalSalesPercentages.length > 0
        ? {
            personal_sales_percentage: personalSalesPercentages[0],
            personal_sales_percentages: personalSalesPercentages,
          }
        : {}),
      ...(shiftSalesPercentages.length > 0
        ? {
            shift_sales_percentage: shiftSalesPercentages[0],
            shift_sales_percentages: shiftSalesPercentages,
          }
        : {}),
    },
  }

  return JSON.stringify(permissions)
}

const parsePermissionsToFormData = (permissionsString: string): Partial<AddPositionFormData> => {
  try {
    const permissions = JSON.parse(permissionsString)

    const adminPanelAccess: Record<string, AccessLevel> = { ...DEFAULT_ADMIN_PANEL_ACCESS } as Record<string, AccessLevel>
    permissions.admin_panel_access?.sections?.forEach((section: any) => {
      adminPanelAccess[section.section] = section.access_level as AccessLevel
    })

    const parsedPersonalSalesPercentages =
      permissions.salary_calculation?.personal_sales_percentages?.map((rule: any) => ({
        categoryId: rule?.category_id || 'all',
        percentage: rule?.percentage?.toString() || '0',
      })) ||
      (permissions.salary_calculation?.personal_sales_percentage
        ? [{
            categoryId: permissions.salary_calculation.personal_sales_percentage?.category_id || 'all',
            percentage: permissions.salary_calculation.personal_sales_percentage?.percentage?.toString() || '0',
          }]
        : [])

    const parsedShiftSalesPercentages =
      permissions.salary_calculation?.shift_sales_percentages?.map((rule: any) => ({
        categoryId: rule?.category_id || 'all',
        percentage: rule?.percentage?.toString() || '0',
      })) ||
      (permissions.salary_calculation?.shift_sales_percentage
        ? [{
            categoryId: permissions.salary_calculation.shift_sales_percentage?.category_id || 'all',
            percentage: permissions.salary_calculation.shift_sales_percentage?.percentage?.toString() || '0',
          }]
        : [])

    return {
      cashAccess: {
        workWithCash: permissions.cash_access?.work_with_cash || false,
        adminHall: permissions.cash_access?.admin_hall || false,
      },
      adminPanelAccess,
      applicationsAccess: {
        confirmInstallation: permissions.applications_access?.confirm_installation || false,
      },
      salaryCalculation: {
        fixedRate: {
          perHour: permissions.salary_calculation?.fixed_rate?.per_hour?.toString() || '',
          perShift: permissions.salary_calculation?.fixed_rate?.per_shift?.toString() || '',
          perMonth: permissions.salary_calculation?.fixed_rate?.per_month?.toString() || '',
        },
        personalSalesPercentages: parsedPersonalSalesPercentages.length > 0
          ? parsedPersonalSalesPercentages
          : [{ ...DEFAULT_SALARY_RULE }],
        shiftSalesPercentages: parsedShiftSalesPercentages.length > 0
          ? parsedShiftSalesPercentages
          : [{ ...DEFAULT_SALARY_RULE }],
      },
    }
  } catch (error) {
    console.error('Failed to parse permissions:', error, 'permissionsString:', permissionsString)
    return {
      cashAccess: {
        workWithCash: false,
        adminHall: false,
      },
      adminPanelAccess: { ...DEFAULT_ADMIN_PANEL_ACCESS } as Record<string, AccessLevel>,
      applicationsAccess: {
        confirmInstallation: false,
      },
      salaryCalculation: {
        fixedRate: {
          perHour: '',
          perShift: '',
          perMonth: '',
        },
        personalSalesPercentage: {
          categoryId: 'all',
          percentage: '0',
        },
        shiftSalesPercentage: {
          categoryId: 'all',
          percentage: '0',
        },
      },
    }
  }
}

export const useAddPositionPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const positionId = id

  const [formData, setFormData] = useState<AddPositionFormData>({
    name: '',
    cashAccess: {
      workWithCash: false,
      adminHall: false,
    },
    adminPanelAccess: { ...DEFAULT_ADMIN_PANEL_ACCESS } as Record<string, AccessLevel>,
    adminPanelSections: ADMIN_PANEL_SECTIONS,
    applicationsAccess: {
      confirmInstallation: false,
    },
    salaryCalculation: {
      fixedRate: {
        perHour: '',
        perShift: '',
        perMonth: '',
      },
      personalSalesPercentages: [{ ...DEFAULT_SALARY_RULE }],
      shiftSalesPercentages: [{ ...DEFAULT_SALARY_RULE }],
    },
    salaryCategories: SALARY_CATEGORIES,
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)

  const { data: existingPosition, isLoading: isLoadingPosition } = useGetPosition(
    positionId || ''
  )

  const { data: allPositions = [] } = useGetPositions()

  const createPositionMutation = useCreatePosition()
  const updatePositionMutation = useUpdatePosition()

  const isLoading = isLoadingPosition
  const isSubmitting = createPositionMutation.isPending || updatePositionMutation.isPending
  const isEditMode = !!positionId

  useEffect(() => {
    if (existingPosition && positionId) {
      console.log('Loading position data:', existingPosition)
      const parsedData = parsePermissionsToFormData(existingPosition.permissions)
      console.log('Parsed data:', parsedData)

      setFormData((prev) => ({
        ...prev,
        name: existingPosition.name || '',
        ...(parsedData.cashAccess && { cashAccess: parsedData.cashAccess }),
        ...(parsedData.adminPanelAccess && { adminPanelAccess: parsedData.adminPanelAccess }),
        ...(parsedData.applicationsAccess && { applicationsAccess: parsedData.applicationsAccess }),
        ...(parsedData.salaryCalculation && { salaryCalculation: parsedData.salaryCalculation }),
      }))
    }
  }, [existingPosition, positionId])

  const validateForm = useCallback((): boolean => {
    const errors: FieldErrors = {}

    if (!formData.name.trim()) {
      errors.name = 'Название должности обязательно'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const isFormValid = formData.name.trim().length > 0

  const handleFieldChange = useCallback(<K extends keyof AddPositionFormData>(
    field: K,
    value: AddPositionFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (fieldErrors.name) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.name
        return newErrors
      })
    }
  }, [fieldErrors])

  const handleNestedFieldChange = useCallback(<K extends keyof AddPositionFormData>(
    section: K,
    field: string,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: value,
      },
    }))
  }, [])

  const handleAdminPanelAccessChange = useCallback((section: string, value: AccessLevel) => {
    setFormData((prev) => ({
      ...prev,
      adminPanelAccess: {
        ...prev.adminPanelAccess,
        [section]: value,
      },
    }))
  }, [])

  const handleSalaryPercentageChange = useCallback((
    type: 'personal' | 'shift',
    index: number,
    field: 'categoryId' | 'percentage',
    value: string
  ) => {
    setFormData((prev) => {
      const targetField =
        type === 'personal' ? 'personalSalesPercentages' : 'shiftSalesPercentages'

      const updatedRules = [...prev.salaryCalculation[targetField]]
      updatedRules[index] = {
        ...updatedRules[index],
        [field]: value,
      }

      return {
        ...prev,
        salaryCalculation: {
          ...prev.salaryCalculation,
          [targetField]: updatedRules,
        },
      }
    })
  }, [])

  const handleAddSalaryCategory = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      salaryCalculation: {
        ...prev.salaryCalculation,
        personalSalesPercentages: [...prev.salaryCalculation.personalSalesPercentages, { ...DEFAULT_SALARY_RULE }],
        shiftSalesPercentages: [...prev.salaryCalculation.shiftSalesPercentages, { ...DEFAULT_SALARY_RULE }],
      },
    }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    try {
      const permissions = formatFormDataToPermissions(formData)

      if (positionId) {
        await updatePositionMutation.mutateAsync({
          id: positionId,
          data: {
            name: formData.name,
            permissions,
          },
        })
      } else {
        await createPositionMutation.mutateAsync({
          name: formData.name,
          permissions,
        })
      }

      navigate('/access/positions')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при сохранении должности'
      setError(errorMessage)
      console.error('Failed to save position:', err)
    }
  }, [formData, positionId, validateForm, createPositionMutation, updatePositionMutation, navigate])

  const handleBack = useCallback(() => {
    navigate('/access/positions')
  }, [navigate])

  return {
    formData,
    isLoading,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    isLoadingPosition,
    isEditMode,
    existingPositions: allPositions,
    handleFieldChange,
    handleNestedFieldChange,
    handleAdminPanelAccessChange,
    handleSalaryPercentageChange,
    handleAddSalaryCategory,
    handleSubmit,
    handleBack,
  }
}
