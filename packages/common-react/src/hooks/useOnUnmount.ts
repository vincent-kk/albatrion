import { useEffect } from 'react';

export const useOnUnmount = (handler: Fn) => {
  useEffect(() => {
    return handler;
  }, []);
};
