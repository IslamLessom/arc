import type { ButtonProps } from '../model/types';
import { ButtonSize, ButtonVariant } from '../model/enums';
import type { ButtonProps as AntdButtonProps } from 'antd/es/button';

interface UseButtonResult {
  antdProps: AntdButtonProps;
}

export const useButton = (props: ButtonProps): UseButtonResult => {
  const {
    variant = ButtonVariant.Default,
    size = ButtonSize.Default,
    ...rest
  } = props;

  const antdType: AntdButtonProps['type'] =
    variant === ButtonVariant.Link
      ? 'link'
      : variant === ButtonVariant.Outline
        ? 'default'
        : variant === ButtonVariant.Ghost
          ? 'text'
          : variant === ButtonVariant.Primary
            ? 'primary'
            : variant === ButtonVariant.Default
              ? 'default'
              : 'primary';

  const danger = variant === ButtonVariant.Destructive;

  const antdSize: AntdButtonProps['size'] =
    size === ButtonSize.Small
      ? 'small'
      : size === ButtonSize.Large
        ? 'large'
        : 'middle';

  return {
    antdProps: {
      type: antdType,
      danger,
      size: antdSize,
      ...rest
    }
  };
};


