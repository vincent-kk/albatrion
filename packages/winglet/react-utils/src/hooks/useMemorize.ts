import { type DependencyList, useMemo } from 'react';

import { isFunction } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

/**
 * Memoizes the input value or function result with optional dependency array.
 *
 * This hook provides two overloads:
 * 1. Direct value memoization: `useMemorize(value, deps?)`
 * 2. Function result memoization: `useMemorize(() => computeValue(), deps?)`
 *
 * When no dependencies are provided (or empty array), the value/function is computed only once.
 * When dependencies are provided, the value/function is recomputed when dependencies change.
 *
 * @example
 * ```typescript
 * // Memoize a value with dependencies
 * const memoizedConfig = useMemorize({ theme, locale }, [theme, locale]);
 *
 * // Memoize expensive computation
 * const expensiveResult = useMemorize(() => heavyComputation(data), [data]);
 *
 * // Memoize once (no dependencies)
 * const stableRef = useMemorize(() => createExpensiveObject());
 * ```
 *
 * @typeParam Type - The type of the value to memoize
 * @typeParam Return - The return type when using function input
 * @param input - The value to memoize or a function that returns the value
 * @param dependencies - Optional dependency array. Defaults to empty array (compute once)
 * @returns The memoized value that remains stable until dependencies change
 */
export const useMemorize: {
  <Return>(input: Fn<[], Return>, dependencies?: DependencyList): Return;
  <Type>(input: Type, dependencies?: DependencyList): Type;
} = <Return>(
  input: Fn<[], Return> | Return,
  dependencies: DependencyList = [],
): Return => {
  return useMemo(
    () => (isFunction(input) ? input() : input),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies,
  );
};
