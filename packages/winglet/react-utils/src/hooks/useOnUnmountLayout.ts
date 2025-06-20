import { useLayoutEffect } from 'react';

import type { Fn } from '@aileron/declare';

/**
 * Executes a handler function when the component unmounts, before DOM updates.
 * Similar to useOnUnmount but uses useLayoutEffect for synchronous execution.
 * Useful for cleanup operations that need to run before DOM mutations.
 * @param handler - The function to execute on component unmount
 */
export const useOnUnmountLayout = (handler: Fn) => {
  useLayoutEffect(() => {
    return handler;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
