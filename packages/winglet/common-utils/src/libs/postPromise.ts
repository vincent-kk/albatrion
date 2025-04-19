import type { Fn } from '@aileron/declare';

const getPostPromise = (): Fn<[task: Fn]> => {
  try {
    if (typeof process?.nextTick === 'function') {
      const resolve = Promise.resolve();
      return (task: Fn) => {
        resolve.then(() => process.nextTick(task));
      };
    }
  } catch {
    // NOTE: In a Browser environment, accessing `process` may throw an error.
  }
  if (typeof setImmediate === 'function')
    return (task: Fn) => {
      setImmediate(task);
    };
  return (task: Fn) => {
    setTimeout(task, 0);
  };
};

export const postPromise = getPostPromise();
