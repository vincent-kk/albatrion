import { useCallback } from 'react';

import { useReference } from './useReference';

/**
 * @description memoized Function을 반환합니다.
 * @param handler - Function
 * @returns memoized Function
 */
export const useHandle = <P extends Array<any>, R>(
  handler: (...args: P) => R,
): ((...args: P) => R) => {
  const handelRef = useReference(handler);
  return useCallback(
    (...args: P) => {
      if (typeof handelRef.current !== 'function') {
        return null as never;
      }
      return handelRef.current(...args);
    },
    [handelRef],
  );
};
