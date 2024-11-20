import { useCallback, useState } from 'react';

export function useTick() {
  const [tick, setTick] = useState(0);
  const updateTick = useCallback(() => {
    setTick((prev) => prev + 1);
  }, []);
  return [tick, updateTick] as const;
}
