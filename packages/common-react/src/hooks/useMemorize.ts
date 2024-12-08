import { useMemo } from 'react';

import { useReference } from './useReference';

export const useMemorize = <T>(input: T) => {
  const inputRef = useReference(input);
  return useMemo(() => inputRef.current, [inputRef]);
};
