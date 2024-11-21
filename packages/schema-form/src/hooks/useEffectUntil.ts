import { type DependencyList, useEffect, useLayoutEffect, useRef } from 'react';

export const useEffectUntil = <Dependencies extends DependencyList>(
  effect: () => boolean,
  dependencies: Dependencies,
) => {
  const isCompleted = useRef(false);
  useEffect(() => {
    if (isCompleted.current) return;
    isCompleted.current = !!effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

export const useLayoutEffectUntil = <Dependencies extends DependencyList>(
  effect: () => boolean,
  dependencies: Dependencies,
) => {
  const isCompleted = useRef(false);
  useLayoutEffect(() => {
    if (isCompleted.current) return;
    isCompleted.current = !!effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};
