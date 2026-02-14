import { StyledDeleteButton } from './styled'

export interface DeleteButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  className?: string
}

export const DeleteButton = ({ onClick, disabled, className }: DeleteButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onClick(e)
  }

  return (
    <StyledDeleteButton
      onClick={handleClick}
      disabled={disabled}
      className={className}
      $disabled={disabled ?? false}
    >
      Удалить
    </StyledDeleteButton>
  )
}
