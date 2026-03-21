'use client';

import React, { forwardRef } from 'react';
import type { InputRef } from 'antd';
import type { InputProps } from '../model/types';
import { useInput } from '../hooks/useInput';
import { StyledInput } from '../styled';

export const Input = forwardRef<InputRef, InputProps>(
  (props, ref) => {
    const { antdProps } = useInput(props);

    return <StyledInput {...antdProps} ref={ref} />;
  }
);

Input.displayName = 'Input';

