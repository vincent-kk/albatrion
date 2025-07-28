import type { Fn } from '@aileron/declare';

import { delay } from './delay';

/**
 * @description Function that executes fn, waits for a certain amount of time, and then returns the result of fn
 * @param {() => Return} fn - Function to execute
 * @param {number} ms - Delay time
 * @returns {Promise<Return>} Return value of fn
 */
export const waitAndReturn: {
  <Return>(fn: Fn<[], Return>, ms?: number): Promise<Return>;
  (fn: undefined, ms?: number): Promise<undefined>;
} = async <Return>(fn: Fn<[], Return> | undefined, ms = 0) => {
  const result = typeof fn === 'function' ? fn() : undefined;
  await delay(ms);
  return result;
};
