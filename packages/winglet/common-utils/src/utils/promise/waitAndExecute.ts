import type { Fn } from '@aileron/declare';

import { delay } from './delay';

/**
 * @description Function that executes fn after a certain amount of time and returns the result
 * @param {Fn<[], T>} fn - Function to execute
 * @param {number} ms - Delay time
 * @returns {Promise<T>} Return value of fn
 */
export async function waitAndExecute<T>(fn: Fn<[], T>, ms?: number): Promise<T>;
export async function waitAndExecute(
  fn: undefined,
  ms?: number,
): Promise<undefined>;

export async function waitAndExecute<T>(fn: Fn<[], T> | undefined, ms = 0) {
  await delay(ms);
  return typeof fn === 'function' ? fn() : undefined;
}
