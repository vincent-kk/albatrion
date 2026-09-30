import { scheduleMacrotask } from '@winglet/common-utils/scheduler';

export const promiseAfterMicrotask = <Value>(value: Value): Promise<Value> =>
  new Promise((resolve) => scheduleMacrotask(() => resolve(value)));
