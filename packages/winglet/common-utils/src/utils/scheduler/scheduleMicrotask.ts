import type { Fn } from '@aileron/declare';

const getScheduleMicrotask = (): Fn<[task: Fn]> => {
  if (typeof queueMicrotask === 'function') return queueMicrotask;
  const resolve = Promise.resolve();
  return (task: Fn) => resolve.then(task);
};

export const scheduleMicrotask = getScheduleMicrotask();
