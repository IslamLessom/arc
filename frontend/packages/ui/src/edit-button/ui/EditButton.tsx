import { StyledEditButton } from './styled'

export interface EditButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  className?: string
}

export const EditButton = ({ onClick, disabled, className }: EditButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onClick(e)
  }

  return (
    <StyledEditButton
      onClick={handleClick}
      disabled={disabled}
      className={className}
      $disabled={disabled ?? false}
    >
      Ред.
    </StyledEditButton>
  )
}
