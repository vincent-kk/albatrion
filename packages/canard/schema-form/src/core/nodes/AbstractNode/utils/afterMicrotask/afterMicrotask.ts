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
  let timerId: ReturnType<typeof setTimeout> | undefined;
  const callback = () => {
    handler();
    timerId = undefined;
  };
  return () => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(callback);
  };
};
