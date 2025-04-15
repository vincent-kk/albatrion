import type { Fn } from '@aileron/declare';

const getMicrotask = (): Fn<[Fn]> => {
  if (typeof queueMicrotask === 'function') return queueMicrotask;
  try {
    if (typeof process?.nextTick === 'function') return process.nextTick;
  } catch {
    // NOTE: In a Browser environment, accessing `process` may throw an error.
  }
  const resolve = Promise.resolve();
  return (fn: Fn) => resolve.then(fn);
};

export const microtask = getMicrotask();
