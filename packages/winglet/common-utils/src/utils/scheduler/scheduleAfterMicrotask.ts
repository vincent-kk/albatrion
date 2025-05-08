import type { Fn } from '@aileron/declare';

type SchedulerFunctions = readonly [Fn<[callback: Fn]>, Fn<[id: any]>];
const getScheduleAfterMicrotask = (): SchedulerFunctions => {
  if (typeof globalThis.requestAnimationFrame === 'function')
    return [
      globalThis.requestAnimationFrame.bind(globalThis),
      globalThis.cancelAnimationFrame.bind(globalThis),
    ] as const;

  if (typeof globalThis.setImmediate === 'function')
    return [
      globalThis.setImmediate.bind(globalThis),
      globalThis.clearImmediate.bind(globalThis),
    ] as const;
  return [
    globalThis.setTimeout.bind(globalThis),
    globalThis.clearTimeout.bind(globalThis),
  ] as const;
};

const [queue, cancel] = getScheduleAfterMicrotask();

export const scheduleAfterMicrotask = (callback: Fn): Fn => {
  let canceled = false;
  const id = queue(() => {
    if (!canceled) callback();
  });
  return () => {
    canceled = true;
    cancel(id);
  };
};
