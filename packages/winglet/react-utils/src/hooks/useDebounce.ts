import { type DependencyList, useEffect, useRef } from 'react';

import type { Fn } from '@aileron/declare';

import { useHandle } from './useHandle';
import { useTimeout } from './useTimeout';

type UseDebounceOptions = {
  /** Whether to execute the callback immediately on the first mount (default: false) */
  immediate?: boolean;
};

/**
 * Debounces a callback function execution based on dependency changes.
 * Delays the callback execution until the specified timeout has passed without any dependency changes.
 *
 * @param callback - The function to debounce
 * @param dependencyList - Array of dependencies that trigger the debounce when changed (defaults to empty array)
 * @param ms - The delay in milliseconds before executing the callback (defaults to 0)
 * @param options - Configuration options for debounce behavior
 * @param options.immediate - Whether to execute the callback immediately on the first mount (defaults to false)
 * @returns An object containing debounce control functions
 * @returns {Function} returns.isIdle - Function that returns whether the debounce scheduler is idle (no pending execution)
 * @returns {Function} returns.cancel - Function to cancel the pending debounced execution
 *
 * @example
 * // Basic usage with search input debouncing
 * const [searchTerm, setSearchTerm] = useState('');
 * const { isIdle, cancel } = useDebounce(
 *   () => {
 *     console.log('Searching for:', searchTerm);
 *     // Perform search API call
 *   },
 *   [searchTerm], // Dependencies - callback will be debounced when searchTerm changes
 *   500 // 500ms delay
 * );
 *
 * @example
 * // With immediate execution on mount
 * const { isIdle, cancel } = useDebounce(
 *   () => console.log('Executed!'),
 *   [value],
 *   1000,
 *   { immediate: true } // Execute immediately on first mount, then debounce subsequent changes
 * );
 *
 * @example
 * // Auto-save functionality
 * const [formData, setFormData] = useState({});
 * const { cancel } = useDebounce(
 *   () => {
 *     saveFormData(formData);
 *   },
 *   [formData], // Debounce save when form data changes
 *   2000 // Save 2 seconds after user stops typing
 * );
 *
 * // Cancel save if user navigates away
 * useEffect(() => {
 *   return () => cancel();
 * }, [cancel]);
 */
export const useDebounce = (
  callback: Fn,
  dependencyList: DependencyList = [],
  ms: number = 0,
  options?: UseDebounceOptions,
) => {
  const isFirstExecution = useRef(true);
  const optionsRef = useRef({
    immediate: !!options?.immediate,
  });

  const handleCallback = useHandle(callback);
  const { isIdle, schedule, cancel } = useTimeout(handleCallback, ms);

  useEffect(() => {
    if (isFirstExecution.current && optionsRef.current.immediate)
      handleCallback();
    else schedule();
    isFirstExecution.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencyList);

  useEffect(() => cancel, [cancel]);

  return {
    isIdle,
    cancel,
  } as const;
};
