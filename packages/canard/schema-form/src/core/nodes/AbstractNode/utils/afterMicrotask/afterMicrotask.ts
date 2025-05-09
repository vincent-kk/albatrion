import { cancelMacrotask, scheduleMacrotask } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

export const afterMicrotask = (handler: Fn): Fn => {
  let id: number | undefined;
  const callback = () => {
    handler();
    id = undefined;
  };
  return () => {
    if (id) cancelMacrotask(id);
    id = scheduleMacrotask(callback);
  };
};
