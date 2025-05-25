import { type DependencyList, useEffect, useRef } from 'react';

/**
 * Executes an effect until a specified condition is met.
 * The effect stops running once it returns true.
 * @param effect - A function that returns a boolean indicating whether the condition is met
 * @param dependencies - Dependency array for the effect
 */
export const useEffectUntil = <Dependencies extends DependencyList>(
  effect: () => boolean,
  dependencies?: Dependencies,
) => {
  const isCompleted = useRef(false);
  useEffect(() => {
    if (isCompleted.current) return;
    isCompleted.current = !!effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};
