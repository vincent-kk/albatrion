import { useCallback, useState } from 'react';

import type { Fn } from '@aileron/types';

import { useReference } from './useReference';

/**
 * @description React Render를 유발하는 tick과 tick을 업데이트하는 함수를 반환합니다.
 * @param {Function} callback - updateTick 호출시에 실행할 callback 함수, optional
 * @returns [tick, updateTick]
 */
export const useTick = (callback?: Fn) => {
  const [tick, setTick] = useState(0);
  const callbackRef = useReference(callback);
  const updateTick = useCallback(() => {
    callbackRef.current?.();
    setTick((prev) => prev + 1);
  }, []);
  return [tick, updateTick] as const;
};
