import * as Styled from '../styled'
import { HELP_LINKS } from '../../lib/constants'

export const HelpLinks = () => (
  <Styled.HelpColumn>
    <Styled.HelpLink href="#" onClick={(e) => e.preventDefault()}>
      {HELP_LINKS.WHAT_IS_WEIGHTED}
    </Styled.HelpLink>
    <Styled.HelpLink href="#" onClick={(e) => e.preventDefault()}>
      {HELP_LINKS.WHEN_EXCLUDE_FROM_DISCOUNTS}
    </Styled.HelpLink>
    <Styled.HelpLink href="#" onClick={(e) => e.preventDefault()}>
      {HELP_LINKS.HOW_TO_CHANGE_COST}
    </Styled.HelpLink>
    <Styled.HelpLink href="#" onClick={(e) => e.preventDefault()}>
      {HELP_LINKS.HOW_TO_ADD_BARCODE}
    </Styled.HelpLink>
    <Styled.HelpLink href="#" onClick={(e) => e.preventDefault()}>
      {HELP_LINKS.WHAT_ARE_MODIFICATIONS}
    </Styled.HelpLink>
  </Styled.HelpColumn>
)
