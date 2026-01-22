import { useOnboardingModal } from '../hooks/useOnboardingModal'
import type { OnboardingModalProps } from '../model/types'
import { OnboardingForm } from '../../../features/onboarding-form'
import * as Styled from './styled'

export const OnboardingModal = (props: OnboardingModalProps) => {
  const { handleSubmit, handleClose } = useOnboardingModal(props)

  if (!props.isOpen) {
    return null
  }

  return (
    <Styled.Overlay $isOpen={props.isOpen}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.ModalTitle>Добро пожаловать!</Styled.ModalTitle>
        </Styled.ModalHeader>
        <Styled.ModalBody>
          <Styled.ModalDescription>
            Для начала работы с системой необходимо заполнить информацию о вашем
            заведении. Это поможет нам настроить систему под ваши потребности.
          </Styled.ModalDescription>
          <OnboardingForm onSubmit={handleSubmit} onCancel={handleClose} />
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}

