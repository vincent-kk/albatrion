import { useEffect, useLayoutEffect } from 'react';

import type { Fn } from '@aileron/declare';

export const useOnUnmount = (handler: Fn) => {
  useEffect(() => {
    return handler;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export const useOnUnmountLayout = (handler: Fn) => {
  useLayoutEffect(() => {
    return handler;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
