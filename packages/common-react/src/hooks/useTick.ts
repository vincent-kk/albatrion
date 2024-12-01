import { useCallback, useState } from 'react';

/**
 * @description React Render를 유발하는 tick과 tick을 업데이트하는 함수를 반환합니다.
 * @returns [tick, updateTick]
 */
export function useTick() {
  const [tick, setTick] = useState(0);
  const updateTick = useCallback(() => {
    setTick((prev) => prev + 1);
  }, []);
  return [tick, updateTick] as const;
}
