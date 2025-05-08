import type { Fn } from '@aileron/declare';

type SchedulerFunctions<Id = any> = {
  afterMicrotask: Fn<[callback: Fn], Id>;
  cancelAfterMicrotask: Fn<[id: Id]>;
};
const getScheduleAfterMicrotask = (): SchedulerFunctions => {
  if (typeof globalThis.requestAnimationFrame === 'function')
    return {
      afterMicrotask: globalThis.requestAnimationFrame.bind(globalThis),
      cancelAfterMicrotask: globalThis.cancelAnimationFrame.bind(globalThis),
    } as const;

  if (typeof globalThis.setImmediate === 'function')
    return {
      afterMicrotask: globalThis.setImmediate.bind(globalThis),
      cancelAfterMicrotask: globalThis.clearImmediate.bind(globalThis),
    } as const;
  return {
    afterMicrotask: globalThis.setTimeout.bind(globalThis),
    cancelAfterMicrotask: globalThis.clearTimeout.bind(globalThis),
  } as const;
};

export const { afterMicrotask, cancelAfterMicrotask } =
  getScheduleAfterMicrotask() as SchedulerFunctions<number>;

export const scheduleAfterMicrotask = (callback: Fn): Fn => {
  let canceled = false;
  const id = afterMicrotask(() => {
    if (!canceled) callback();
  });
  return () => {
    canceled = true;
    cancelAfterMicrotask(id);
  };
};
