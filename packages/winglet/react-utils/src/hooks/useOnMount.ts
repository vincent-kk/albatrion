import { type EffectCallback, useEffect, useLayoutEffect } from 'react';

export const useOnMount = (handler: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(handler, []);
};

export const useOnMountLayout = (handler: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(handler, []);
};
