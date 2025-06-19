import { type DependencyList, useEffect, useRef } from 'react';

import type { Fn } from '@aileron/declare';

import { useHandle } from './useHandle';
import { useTimeout } from './useTimeout';

type UseDebounceOptions = {
  /** Whether to execute the callback immediately on dependency changes (default: true) */
  immediate?: boolean;
};

/**
 * Debounces a callback function execution based on dependency changes.
 * Delays the callback execution until the specified timeout has passed without any dependency changes.
 *
 * @param callback - The function to debounce
 * @param dependencyList - Array of dependencies that trigger the debounce when changed (defaults to `undefined`)
 * @param ms - The delay in milliseconds before executing the callback (defaults to `0`)
 * @param options - Configuration options for debounce behavior
 * @param options.immediate - Whether to execute the callback immediately on dependency changes (defaults to `true`)
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
 * // With immediate execution on dependency changes
 * const { isIdle, cancel } = useDebounce(
 *   () => console.log('Executed!'),
 *   [value],
 *   1000,
 *   { immediate: true } // Execute immediately on dependency changes, then debounce subsequent changes
 * );
 *
 * @example
 * // With immediate execution including initial mount
 * const [userId, setUserId] = useState(currentUser.id);
 * const { cancel } = useDebounce(
 *   () => fetchUserProfile(userId),
 *   [userId],
 *   300,
 *   {
 *     immediate: true,
 *   }
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
  dependencyList?: DependencyList,
  ms?: number,
  options?: UseDebounceOptions,
) => {
  const optionsRef = useRef({ immediate: options?.immediate ?? true });
  const isScheduled = useRef(false);

  const handleCallback = useHandle(callback);
  const debouncedCallback = useHandle(() => {
    if (optionsRef.current.immediate) {
      if (isScheduled.current) {
        isScheduled.current = false;
        handleCallback();
      }
    } else handleCallback();
  });

  const { isIdle, schedule, cancel } = useTimeout(debouncedCallback, ms);

  useEffect(() => {
    if (optionsRef.current.immediate) {
      if (isIdle()) {
        handleCallback();
        isScheduled.current = false;
      } else isScheduled.current = true;
    }
    schedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencyList);

  useEffect(() => cancel, [cancel]);

  return {
    isIdle,
    cancel,
  } as const;
};
