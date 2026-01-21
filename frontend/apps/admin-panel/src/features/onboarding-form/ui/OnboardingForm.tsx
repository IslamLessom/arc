import { useOnboardingForm } from '../hooks/useOnboardingForm'
import type { OnboardingFormProps } from '../model/types'
import { Button } from '@restaurant-pos/ui'
import * as Styled from './styled'
import { renderQuestionField } from '../lib/renderQuestionField'

export const OnboardingForm = (props: OnboardingFormProps) => {
  const {
    questions,
    answers,
    isLoading,
    isSubmitting,
    error,
    handleFieldChange,
    handleSubmit,
    shouldShowQuestion,
  } = useOnboardingForm(props)
  
  if (isLoading) {
    return <div>Загрузка вопросов...</div>
  }
  
  if (questions.length === 0) {
    return <div>Вопросы не найдены</div>
  }
  
  // Группируем вопросы по шагам для отображения
  const visibleQuestions = questions.filter(shouldShowQuestion)
  
  return (
    <Styled.Form onSubmit={handleSubmit}>
      {visibleQuestions.map((question) => {
        const value = answers[question.key]
        const fieldId = `field-${question.key}`
        
        // Для boolean полей label уже в чекбоксе
        if (question.type === 'boolean') {
          return (
            <div key={question.id}>
              {renderQuestionField(
                question,
                value,
                (newValue) => handleFieldChange(question.key, newValue),
                isSubmitting
              )}
            </div>
          )
        }
        
        // Для остальных типов показываем label отдельно
        return (
          <Styled.InputGroup key={question.id}>
            <Styled.Label htmlFor={fieldId}>
              {question.label}
              {question.required && ' *'}
            </Styled.Label>
            {renderQuestionField(
              question,
              value,
              (newValue) => handleFieldChange(question.key, newValue),
              isSubmitting
            )}
          </Styled.InputGroup>
        )
      })}
      
      {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}
      
      <Styled.ButtonGroup>
        <Button htmlType="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? 'Отправка...' : 'Отправить'}
        </Button>
      </Styled.ButtonGroup>
    </Styled.Form>
  )
}
