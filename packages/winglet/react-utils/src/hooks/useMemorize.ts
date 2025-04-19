import { useMemo } from 'react';

export const useMemorize = <T>(input: T) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => input, []);
};
