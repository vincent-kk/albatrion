import type { Fn } from '@aileron/declare';

/**
 * Type definition for macrotask scheduling functions
 * @template Id - Type of ID returned by the scheduler
 */
type SchedulerFunctions<Id = any> = {
  /**
   * Macrotask scheduling function
   * @param callback - Callback function to execute
   * @returns ID returned by scheduleMacrotask function
   */
  scheduleMacrotask: Fn<[callback: Fn], Id>;
  /**
   * Function to cancel scheduled macrotask
   * @param id - ID returned by scheduleMacrotask function
   */
  cancelMacrotask: Fn<[id: Id]>;
};

/**
 * Function to return appropriate macrotask scheduler for the environment
 * Prefers setImmediate if supported, otherwise uses setTimeout
 * @returns Macrotask scheduling and cancellation functions
 */
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

/**
 * Function to schedule a cancellable macrotask
 * @param callback - Callback function to execute
 * @returns Function to cancel the scheduled task
 */
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
