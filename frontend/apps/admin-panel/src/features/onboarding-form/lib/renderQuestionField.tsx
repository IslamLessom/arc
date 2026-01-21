import * as Styled from '../ui/styled'
import type { OnboardingQuestion } from '@restaurant-pos/api-client'

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
    case 'phone':
      return (
        <Styled.Input
          id={fieldId}
          type={question.type === 'phone' ? 'tel' : question.type}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          disabled={disabled}
          required={question.required}
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

