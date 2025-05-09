import type { Fn } from '@aileron/declare';

type SchedulerFunctions<Id = any> = {
  scheduleMacrotask: Fn<[callback: Fn], Id>;
  cancelMacrotask: Fn<[id: Id]>;
};
const getScheduleMacrotask = (): SchedulerFunctions => {
  if (typeof globalThis.setImmediate === 'function')
    return {
      scheduleMacrotask: globalThis.setImmediate.bind(globalThis),
      cancelMacrotask: globalThis.clearImmediate.bind(globalThis),
    } as const;
  return {
    scheduleMacrotask: globalThis.setTimeout.bind(globalThis),
    cancelMacrotask: globalThis.clearTimeout.bind(globalThis),
  } as const;
};

export const { scheduleMacrotask, cancelMacrotask } =
  getScheduleMacrotask() as SchedulerFunctions<number>;

export const scheduleCancelableMacrotask = (callback: Fn): Fn => {
  let canceled = false;
  const id = scheduleMacrotask(() => {
    if (!canceled) callback();
  });
  return () => {
    canceled = true;
    cancelMacrotask(id);
  };
};
