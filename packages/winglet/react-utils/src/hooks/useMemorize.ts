import { useMemo } from 'react';

export const useMemorize = <T>(input: T) => {
  return useMemo(() => input, []);
};
