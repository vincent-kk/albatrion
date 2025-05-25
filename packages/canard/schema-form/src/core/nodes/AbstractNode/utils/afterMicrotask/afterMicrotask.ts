import { cancelMacrotask, scheduleMacrotask } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

/**
 * Creates a function that runs the given function as a macrotask.
 * If the function is called multiple times, it cancels the previous task and schedules a new task.
 * @param handler - Function to run as a macrotask
 * @returns Function that cancels the previous task and schedules a new task
 */
export const afterMicrotask = (handler: Fn): Fn => {
  let id: number | undefined;
  const callback = () => {
    handler();
    id = undefined;
  };
  return () => {
    if (id) cancelMacrotask(id);
    id = scheduleMacrotask(callback);
  };
};
