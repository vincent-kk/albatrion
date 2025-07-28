import { useRef } from 'react';

import { isFunction } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

/**
 * Returns a constant value. If the input is a function, executes it and stores the result.
 * The value is computed only once during the component's lifetime.
 * @param input - A constant value or a function that returns a value
 * @returns The constant value or the result of the function execution
 */
export const useTruthyConstant: {
  <Return>(input: Fn<[], Return>): Return;
  <Type>(input: Type): Type;
} = <Return>(input: Fn<[], Return> | Return): Return => {
  const ref = useRef<Return>(undefined);
  if (!ref.current) ref.current = isFunction(input) ? input() : input;
  return ref.current;
};
