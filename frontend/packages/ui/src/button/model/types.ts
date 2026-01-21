import type { ButtonProps as AntdButtonProps } from 'antd/es/button';
import type { ButtonVariant, ButtonSize } from './enums';

export interface ButtonProps
  extends Omit<AntdButtonProps, 'type' | 'danger' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}


