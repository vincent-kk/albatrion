import { useEffect, useRef } from 'react';

export const useOnUnmount = (handler: Fn<any[], void>) => {
  const handlerRef = useRef(handler);
  useEffect(() => {
    return handlerRef.current;
  }, []);
};
