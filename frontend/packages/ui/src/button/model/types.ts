import type { ButtonProps as AntdButtonProps } from 'antd/es/button';
import type { ButtonVariant, ButtonSize } from './enums';
import type { ReactNode } from 'react';

export interface ButtonProps
  extends Omit<AntdButtonProps, 'type' | 'danger' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}


