import { type EffectCallback, useLayoutEffect } from 'react';

/**
 * Executes a handler function only once when the component mounts, before DOM updates.
 * Similar to useOnMount but uses useLayoutEffect for synchronous execution.
 * Useful for DOM measurements or preventing visual flicker.
 * @param handler - The function to execute on component mount
 */
export const useOnMountLayout = (handler: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(handler, []);
};
