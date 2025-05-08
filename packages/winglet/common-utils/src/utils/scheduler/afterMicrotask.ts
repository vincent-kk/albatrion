import type { Fn } from '@aileron/declare';

const getAfterMicrotask = (): Fn<[callback: Fn]> => {
  if (typeof globalThis.requestAnimationFrame === 'function')
    return globalThis.requestAnimationFrame.bind(globalThis);
  if (typeof globalThis.setImmediate === 'function')
    return globalThis.setImmediate.bind(globalThis);
  return globalThis.setTimeout.bind(globalThis);
};

export const afterMicrotask = getAfterMicrotask();
