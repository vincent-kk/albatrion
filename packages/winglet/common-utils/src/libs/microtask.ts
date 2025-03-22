import type { Fn } from '@aileron/types';

const getMicrotask = (): Fn<[Fn]> => {
  if (typeof queueMicrotask === 'function') return queueMicrotask;
  if (typeof process?.nextTick === 'function') return process.nextTick;
  const promise = Promise.resolve();
  return (fn: Fn) => promise.then(fn);
};

export const microtask = getMicrotask();
