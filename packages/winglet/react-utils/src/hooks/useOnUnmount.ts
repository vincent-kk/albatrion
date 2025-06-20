import { useEffect } from 'react';

import type { Fn } from '@aileron/declare';

/**
 * Executes a handler function when the component unmounts.
 * Equivalent to returning a cleanup function from useEffect with an empty dependency array.
 * @param handler - The function to execute on component unmount
 */
export const useOnUnmount = (handler: Fn) => {
  useEffect(() => {
    return handler;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
