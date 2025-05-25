import { useRef } from 'react';

import { isFunction } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

/**
 * Returns a constant value. If the input is a function, executes it and stores the result.
 * The value is computed only once during the component's lifetime.
 * @param input - A constant value or a function that returns a value
 * @returns The constant value or the result of the function execution
 */
export const useConstant: {
  <Return>(input: Fn<[], Return>): Return;
  <T>(input: T): T;
} = <Return>(input: Fn<[], Return> | Return): Return => {
  const ref = useRef<{ value: Return }>(undefined);
  if (!ref.current) {
    ref.current = {
      value: isFunction(input) ? input() : input,
    };
  }
  return ref.current.value;
};
