import { useEffect, useLayoutEffect } from 'react';

import type { Fn } from '@aileron/types';

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
