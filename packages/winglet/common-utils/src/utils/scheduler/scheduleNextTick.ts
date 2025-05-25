import type { Fn } from '@aileron/declare';

/**
 * Function to return appropriate nextTick scheduler for the environment
 * Implementation priority by platform:
 * 1. Node.js: process.nextTick + Promise
 * 2. Browser (if supported): setImmediate
 * 3. Other environments: setTimeout(0)
 * @returns nextTick scheduling function
 */
const getScheduleNextTick = (): Fn<[task: Fn]> => {
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

/**
 * Function to execute a task on the next event loop tick
 * Automatically selects the optimal implementation based on the environment
 * @param task - Function to execute on the next tick
 */
export const scheduleNextTick = getScheduleNextTick();
