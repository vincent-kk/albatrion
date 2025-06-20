import { type DependencyList, useMemo } from 'react';

/**
 * Memoizes the input value and preserves it throughout the component's lifetime.
 * Similar to useMemo but with an empty dependency array, ensuring the value is computed only once.
 * Useful for maintaining stable references to objects or expensive computations.
 * @typeParam T - The type of the value to memoize
 * @param input - The value to memoize
 * @returns The memoized value that remains constant across re-renders
 */
export const useMemorize = <T>(input: T, dependencies: DependencyList = []) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => input, dependencies);
};
