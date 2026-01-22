'use client';

import React, { forwardRef } from 'react';
import type { ButtonProps } from '../model/types';
import { useButton } from '../hooks/useButton';
import { StyledButton } from '../styled';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { antdProps } = useButton(props);
    const { variant } = props;

    return <StyledButton {...antdProps} $variant={variant} ref={ref} />;
  }
);

Button.displayName = 'Button';


