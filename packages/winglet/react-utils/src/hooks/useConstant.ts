import { useMemo } from 'react';

/**
 * Creates a constant value that persists throughout the component's entire lifecycle.
 *
 * This hook ensures that the provided value is computed only once during the component's
 * initial render and remains unchanged across all subsequent re-renders. It's a specialized
 * version of `useMemo` with an empty dependency array, guaranteeing referential stability.
 *
 * ### Use Cases
 * - **Stable Object/Array References**: Prevent unnecessary re-renders in child components
 *   that depend on object or array props
 * - **Expensive Initial Computations**: Compute complex values only once per component instance
 * - **Default Configuration Objects**: Create immutable default settings that won't trigger effects
 * - **Event Handler References**: Maintain stable function references without useCallback overhead
 *
 * ### Key Differences from Related Hooks
 * - Unlike `useMemo`, this hook never recomputes the value
 * - Unlike `useMemorize`, it doesn't accept dependencies
 * - Unlike `useRef`, it doesn't provide a mutable container
 *
 * @example
 * ```typescript
 * // Stable object reference for React.memo optimization
 * const EmptyState = React.memo(({ config }) => { ... });
 * const Parent = () => {
 *   const defaultConfig = useConstant({ showIcon: true, message: 'No data' });
 *   return <EmptyState config={defaultConfig} />; // Never re-renders due to config
 * };
 *
 * // Expensive computation that runs only once
 * const expensiveData = useConstant(() => {
 *   return Array.from({ length: 10000 }, (_, i) =>
 *     calculateComplexValue(i)
 *   );
 * });
 *
 * // Stable callback without useCallback
 * const logHandler = useConstant(() => (value: string) => {
 *   console.log('[Component]:', value);
 * });
 *
 * // Default values for hooks or effects
 * const defaultFilters = useConstant({ status: 'active', page: 1 });
 * const [filters, setFilters] = useState(defaultFilters);
 * ```
 *
 * @typeParam Type - The type of the value to be kept constant
 * @param input - The value to memoize. If a function is passed, it's stored as-is, not executed
 * @returns The memoized value that remains constant throughout the component lifecycle
 */
export const useConstant = <Type>(input: Type) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => input, []);
};
