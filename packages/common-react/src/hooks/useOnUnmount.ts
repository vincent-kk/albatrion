import { useEffect, useLayoutEffect } from 'react';

export const useOnUnmount = (handler: Fn) => {
  useEffect(() => {
    return handler;
  }, []);
};

export const useOnUnmountLayout = (handler: Fn) => {
  useLayoutEffect(() => {
    return handler;
  }, []);
};
