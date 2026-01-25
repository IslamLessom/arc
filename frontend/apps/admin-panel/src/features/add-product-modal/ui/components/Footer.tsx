import * as Styled from '../styled'
import { BUTTON_TEXT } from '../../lib/constants'

interface FooterProps {
  isFormValid: boolean
  isSubmitting: boolean
  handleSubmit: (e?: React.FormEvent<Element>, shouldCreateAnother?: boolean) => Promise<void>
  productId?: string
}

export const Footer = ({ isFormValid, isSubmitting, handleSubmit, productId }: FooterProps) => (
  <Styled.ModalFooter>
    <Styled.FooterActions>
      <Styled.SaveButton
        type="submit"
        onClick={handleSubmit}
        disabled={!isFormValid || isSubmitting}
        $disabled={!isFormValid || isSubmitting}
      >
        {isSubmitting ? BUTTON_TEXT.SAVING : BUTTON_TEXT.SAVE}
      </Styled.SaveButton>
      {!productId && (
        <Styled.SaveAndCreateButton
          type="button"
          onClick={(e) => {
            handleSubmit(e, true)
          }}
          disabled={!isFormValid || isSubmitting}
          $disabled={!isFormValid || isSubmitting}
        >
          {BUTTON_TEXT.SAVE_AND_CREATE}
        </Styled.SaveAndCreateButton>
      )}
    </Styled.FooterActions>
  </Styled.ModalFooter>
)
