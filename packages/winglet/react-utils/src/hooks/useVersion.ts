import { useCallback, useState } from 'react';

import type { Fn } from '@aileron/declare';

import { useReference } from './useReference';

/**
 * Returns a version number that triggers React re-renders and a function to update it.
 * Useful for forcing component re-renders when needed.
 * @param callback - Optional callback function to execute when updateVersion is called
 * @returns [version, updateVersion] - The version number and a function to update it
 * @example
 * const [version, forceUpdate] = useVersion();
 * // Force re-render when needed
 * const handleRefresh = () => forceUpdate();
 */
export const useVersion = (callback?: Fn) => {
  const [version, setVersion] = useState(0);
  const callbackRef = useReference(callback);
  const update = useCallback(() => {
    callbackRef.current?.();
    setVersion((prev) => prev + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [version, update] as const;
};
