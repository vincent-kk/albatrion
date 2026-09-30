import {
  cancelMacrotaskSafe,
  scheduleMacrotaskSafe,
} from '@winglet/common-utils/scheduler';

import type { Fn } from '@aileron/declare';

/**
 * Creates a function that runs the given function as a macrotask.
 *
 * If the function is called multiple times, it cancels the previous task and schedules a new task.
 *
 * @note Using setTimeout instead of MessageChannel-based setImmediate to avoid scheduling conflicts with React's internal Fiber scheduler
 *
 * @param handler - Function to run as a macrotask
 * @returns Function that cancels the previous task and schedules a new task
 */
export const afterMicrotask = (handler: Fn): Fn => {
  let macrotaskId: number | undefined;
  const callback = () => {
    handler();
    macrotaskId = undefined;
  };
  return () => {
    if (macrotaskId) cancelMacrotaskSafe(macrotaskId);
    macrotaskId = scheduleMacrotaskSafe(callback);
  };
};
