import { type DependencyList, useMemo } from 'react';

import { isFunction } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

/**
 * Memoizes a value or function result with dependency-based recomputation control.
 *
 * This hook provides two distinct behaviors based on input type:
 * 1. **Value Memoization**: Direct value caching with dependency tracking
 * 2. **Function Result Memoization**: Lazy computation with dependency-based recomputation
 *
 * ### Key Differences from Related Hooks
 * - **vs useMemo**: Provides function overloading and cleaner API for both patterns
 * - **vs useConstant**: Supports dependencies and recomputation (useConstant is always constant)
 * - **vs useCallback**: Returns computed values, not functions
 *
 * ### Performance Benefits
 * - Prevents expensive object recreation when dependencies haven't changed
 * - Enables complex computations to run only when necessary
 * - Maintains referential stability for React.memo optimizations
 *
 * @example
 * ```typescript
 * // Direct value memoization with dependencies
 * const config = useMemorize({ theme, locale, apiUrl }, [theme, locale, apiUrl]);
 * // Only creates new object when theme, locale, or apiUrl changes
 *
 * // Expensive computation with dependencies
 * const processedData = useMemorize(() => {
 *   console.log('Processing...'); // Only logs when data changes
 *   return data.map(item => expensiveTransform(item));
 * }, [data]);
 *
 * // One-time computation (empty dependencies)
 * const expensiveConstant = useMemorize(() => generateLargeDataset());
 * // Computed only once, never recalculated
 *
 * // Context value optimization
 * const contextValue = useMemorize({
 *   user,
 *   settings,
 *   actions: { login, logout }
 * }, [user, settings]);
 * // Prevents context consumers from re-rendering unnecessarily
 *
 * // Conditional memoization
 * const result = useMemorize(() => {
 *   return isEnabled ? expensiveComputation(data) : fallbackValue;
 * }, [isEnabled, data]);
 * ```
 *
 * @typeParam Type - The type of the value to memoize (direct value overload)
 * @typeParam Return - The return type when using function input (function overload)
 * @param input - The value to memoize or a function that computes the value
 * @param dependencies - Dependency array. When changed, triggers recomputation (defaults to empty array)
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
