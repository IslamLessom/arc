import type { InputProps } from '../model/types';
import { InputSize } from '../model/enums';
import type { InputProps as AntdInputProps } from 'antd/es/input';

interface UseInputResult {
  antdProps: AntdInputProps;
}

export const useInput = (props: InputProps): UseInputResult => {
  const {
    size = InputSize.Middle,
    ...rest
  } = props;

  const antdSize: AntdInputProps['size'] =
    size === InputSize.Small
      ? 'small'
      : size === InputSize.Large
        ? 'large'
        : 'middle';

  return {
    antdProps: {
      size: antdSize,
      ...rest
    }
  };
};

