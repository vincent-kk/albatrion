import { useMemo } from 'react';

/**
 * Memoizes the input value and preserves it throughout the component's lifetime.
 *
 * This hook is a specialized version of useMemo with an empty dependency array,
 * ensuring the value is computed only once during the component's initial render
 * and remains constant across all subsequent re-renders.
 *
 * Unlike useMemorize, this hook doesn't accept dependencies and always maintains
 * the same reference/value throughout the component's lifetime. It's particularly
 * useful for:
 * - Creating stable references to objects or arrays
 * - Expensive computations that should only run once
 * - Default values that should remain constant
 * - Avoiding unnecessary re-creations of complex data structures
 *
 * @example
 * ```typescript
 * // Memoize an object to maintain stable reference
 * const defaultConfig = useConstant({ theme: 'light', locale: 'en' });
 *
 * // Memoize expensive computation result
 * const expensiveResult = useConstant(heavyComputation());
 *
 * // Memoize function reference
 * const stableHandler = useConstant(() => console.log('handler'));
 *
 * // Memoize array to prevent re-renders
 * const options = useConstant(['option1', 'option2', 'option3']);
 * ```
 *
 * @typeParam Type - The type of the value to memoize
 * @param input - The value to memoize (computed only once)
 * @returns The memoized value that remains constant across all re-renders
 */
export const useConstant = <Type>(input: Type) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => input, []);
};
