import type { Fn } from '@aileron/declare';

import { delay } from './delay';

/**
 * @description Function that executes fn after a certain amount of time and returns the result
 * @param {() => Return} fn - Function to execute
 * @param {number} ms - Delay time
 * @returns {Promise<Return>} Return value of fn
 */
export const waitAndExecute: {
  <Return>(fn: Fn<[], Return>, ms?: number): Promise<Return>;
  (fn: undefined, ms?: number): Promise<undefined>;
} = async <Return>(fn: Fn<[], Return> | undefined, ms = 0) => {
  await delay(ms);
  return typeof fn === 'function' ? fn() : undefined;
};
