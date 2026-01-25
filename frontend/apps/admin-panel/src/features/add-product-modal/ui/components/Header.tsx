import * as Styled from '../styled'
import { MODAL_TITLES, ARIA_LABELS } from '../../lib/constants'

interface HeaderProps {
  productId?: string
  onClose: () => void
}

export const Header = ({ productId, onClose }: HeaderProps) => (
  <Styled.PageHeader>
    <Styled.HeaderLeft>
      <Styled.BackButton
        type="button"
        onClick={onClose}
        aria-label={ARIA_LABELS.CLOSE_MODAL}
      >
        ←
      </Styled.BackButton>
      <Styled.HeaderTitle id="modal-title">
        {productId ? MODAL_TITLES.EDIT : MODAL_TITLES.ADD}
      </Styled.HeaderTitle>
    </Styled.HeaderLeft>
  </Styled.PageHeader>
)
