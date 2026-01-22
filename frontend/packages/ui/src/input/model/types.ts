import type { InputProps as AntdInputProps } from 'antd/es/input';
import type { InputSize } from './enums';

export interface InputProps
  extends Omit<AntdInputProps, 'size'> {
  size?: InputSize;
}

