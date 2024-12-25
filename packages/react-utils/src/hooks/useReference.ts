import { useRef } from 'react';

export const useReference = <T>(value: T) => {
  const reference = useRef<T>(value);
  reference.current = value;
  return reference;
};
