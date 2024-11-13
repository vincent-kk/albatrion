import { useCallback, useState } from 'react';

import { getRandomNumber } from '@lumy/common/utils/random';

export function useTick() {
  const [tick, setTick] = useState(getRandomNumber());
  const updateTick = useCallback(() => {
    setTick(getRandomNumber());
  }, []);
  return [tick, updateTick] as const;
}
