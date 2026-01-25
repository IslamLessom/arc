import * as Styled from '../ui/styled'
import type { OnboardingQuestion } from '@restaurant-pos/api-client'

// Phone mask function for Russian format: +7 (___) - ___ - ____
function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, '')

  // Ensure it starts with +7
  let formatted = '+7'
  const digits = cleaned.replace(/^\+7/, '').replace(/\D/g, '')

  if (digits.length >= 1) {
    formatted += ` (${digits.slice(0, 3)}`
  }
  if (digits.length >= 4) {
    formatted += `) - ${digits.slice(3, 6)}`
  }
  if (digits.length >= 7) {
    formatted += ` - ${digits.slice(6, 10)}`
  }

  return formatted
}

export function renderQuestionField(
  question: OnboardingQuestion,
  value: string | number | boolean,
  onChange: (value: string | number | boolean) => void,
  disabled: boolean
) {
  const fieldId = `field-${question.key}`
  
  switch (question.type) {
    case 'text':
    case 'email':
      return (
        <Styled.Input
          id={fieldId}
          type={question.type}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          disabled={disabled}
          required={question.required}
        />
      )

    case 'phone':
      return (
        <Styled.Input
          id={fieldId}
          type="tel"
          value={String(value)}
          onChange={(e) => {
            const formatted = formatPhoneNumber(e.target.value)
            onChange(formatted)
          }}
          placeholder="+7 (___) - ___ - ____"
          disabled={disabled}
          required={question.required}
          maxLength={21} // +7 (123) - 456 - 7890 = 21 characters
        />
      )
    
    case 'number':
      return (
        <Styled.Input
          id={fieldId}
          type="number"
          min="0"
          value={typeof value === 'number' ? value : 0}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
          placeholder={question.placeholder}
          disabled={disabled}
          required={question.required}
        />
      )
    
    case 'boolean':
      return (
        <Styled.CheckboxGroup>
          <Styled.Checkbox
            id={fieldId}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
          <Styled.CheckboxLabel htmlFor={fieldId}>
            {question.label}
          </Styled.CheckboxLabel>
        </Styled.CheckboxGroup>
      )
    
    case 'select':
      return (
        <Styled.Select
          id={fieldId}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={question.required}
        >
          {!question.required && <option value="">Выберите...</option>}
          {question.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Styled.Select>
      )
    
    default:
      return null
  }
}

