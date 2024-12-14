import { type EffectCallback, useEffect } from 'react';

export const useOnMount = (handler: EffectCallback) => {
  useEffect(handler, []);
};
