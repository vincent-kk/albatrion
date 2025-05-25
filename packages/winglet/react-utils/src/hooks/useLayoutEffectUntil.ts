import { type DependencyList, useLayoutEffect, useRef } from 'react';

/**
 * Executes a layout effect until a specified condition is met.
 * Similar to useEffectUntil but uses useLayoutEffect for synchronous execution before DOM updates.
 * The effect stops running once it returns true.
 * @param effect - A function that returns a boolean indicating whether the condition is met
 * @param dependencies - Dependency array for the layout effect
 */
export const useLayoutEffectUntil = <Dependencies extends DependencyList>(
  effect: () => boolean,
  dependencies?: Dependencies,
) => {
  const isCompleted = useRef(false);
  useLayoutEffect(() => {
    if (isCompleted.current) return;
    isCompleted.current = !!effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};
