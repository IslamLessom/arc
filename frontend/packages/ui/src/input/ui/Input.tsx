'use client';

import React, { forwardRef } from 'react';
import type { InputProps } from '../model/types';
import { useInput } from '../hooks/useInput';
import { StyledInput } from '../styled';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const { antdProps } = useInput(props);

    return <StyledInput {...antdProps} ref={ref} />;
  }
);

Input.displayName = 'Input';

