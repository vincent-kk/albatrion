import type { Fn } from '@aileron/declare';

/**
 * Function to return appropriate microtask scheduler for the environment
 * Uses queueMicrotask if supported, otherwise implements via Promise
 * @returns Microtask scheduling function
 */
const getScheduleMicrotask = (): Fn<[task: Fn]> => {
  if (typeof queueMicrotask === 'function') return queueMicrotask;
  const resolve = Promise.resolve();
  return (task: Fn) => resolve.then(task);
};

/**
 * Function to schedule a task in the microtask queue
 * Executes the task after the current execution context, before the next event loop tick
 * @param task - Function to schedule
 */
export const scheduleMicrotask = getScheduleMicrotask();
