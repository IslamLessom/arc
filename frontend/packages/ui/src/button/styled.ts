import styled from 'styled-components';
import { Button as AntdButton } from 'antd';
import { ButtonVariant } from './model/enums';

export const StyledButton = styled(AntdButton)<{ $variant?: ButtonVariant }>`
  ${({ $variant }) =>
    $variant === ButtonVariant.Link &&
    `
    font-size: 14px;
    color: #1890ff;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    
    &:hover {
      color: #40a9ff;
    }
    
    &:focus {
      color: #40a9ff;
    }
  `}
`;


