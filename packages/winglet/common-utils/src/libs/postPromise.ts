import type { Fn } from '@aileron/declare';

const getPostPromise = (): Fn<[Fn]> => {
  try {
    if (typeof process?.nextTick === 'function') {
      const resolve = Promise.resolve();
      return (fn: Fn) => {
        resolve.then(() => process.nextTick(fn));
      };
    }
  } catch {
    // NOTE: In a Browser environment, accessing `process` may throw an error.
  }
  if (typeof setImmediate === 'function')
    return (fn: Fn) => {
      setImmediate(fn);
    };
  return (fn: Fn) => {
    setTimeout(fn, 0);
  };
};

export const postPromise = getPostPromise();
