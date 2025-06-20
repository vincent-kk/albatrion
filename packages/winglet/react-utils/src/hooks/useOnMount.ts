import { type EffectCallback, useEffect } from 'react';

/**
 * Executes a handler function only once when the component mounts.
 * Equivalent to useEffect with an empty dependency array.
 * @param handler - The function to execute on component mount
 */
export const useOnMount = (handler: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(handler, []);
};
