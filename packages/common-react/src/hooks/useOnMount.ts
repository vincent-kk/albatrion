import { type EffectCallback, useEffect, useLayoutEffect } from 'react';

export const useOnMount = (handler: EffectCallback) => {
  useEffect(handler, []);
};

export const useOnMountLayout = (handler: EffectCallback) => {
  useLayoutEffect(handler, []);
};
