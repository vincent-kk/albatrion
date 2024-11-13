import { useCallback, useRef } from 'react';

export function useHandle<P extends Array<any>, R>(
  handler: (...args: P) => R,
): (...args: P) => R {
  const handelRef = useRef(handler);
  handelRef.current = handler;
  return useCallback((...args: P) => {
    if (typeof handelRef.current !== 'function') {
      return null as never;
    }
    return handelRef.current(...args);
  }, []);
}
