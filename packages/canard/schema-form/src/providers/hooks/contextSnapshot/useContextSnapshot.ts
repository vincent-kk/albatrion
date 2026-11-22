import { useRef } from 'react';

import { areContextsEqual } from './utils/areContextsEqual';

/**
 * Retain content-equal context while publishing changed opaque references.
 * React owns the ref lifetime; a same-instance mutation cannot publish a new snapshot.
 * @param input - Form or provider context supplied by the caller.
 * @returns The prior reference when context inputs remain equal.
 */
export const useContextSnapshot = <Input extends object | undefined>(
  input: Input,
): Input => {
  const snapshot = useRef(input);
  if (!areContextsEqual(snapshot.current, input)) snapshot.current = input;
  return snapshot.current;
};
