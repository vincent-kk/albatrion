import { useCallback } from 'react';

import { useReference } from './useReference';

/**
 * Returns a memoized function that always uses the latest version of the handler.
 * This prevents stale closure issues while maintaining referential stability.
 * @param handler - The function to be memoized
 * @returns A memoized function that calls the latest version of the handler
 */
export const useHandle = <P extends Array<any>, R>(
  handler?: (...args: P) => R,
): ((...args: P) => R) => {
  const handelRef = useReference(handler);
  return useCallback(
    (...args: P) => {
      if (typeof handelRef.current === 'function')
        return handelRef.current(...args);
      return null as never;
    },
    [handelRef],
  );
};
