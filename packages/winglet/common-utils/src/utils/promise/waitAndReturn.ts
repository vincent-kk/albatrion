import { delay } from './delay';

/**
 * @description Function that executes fn, waits for a certain amount of time, and then returns the result of fn
 * @param {Fn<[], T>} fn - Function to execute
 * @param {number} ms - Delay time
 * @returns {Promise<T>} Return value of fn
 */
export async function waitAndReturn<T>(fn: () => T, ms?: number): Promise<T>;
export async function waitAndReturn(
  fn: undefined,
  ms?: number,
): Promise<undefined>;

export async function waitAndReturn<T>(fn: (() => T) | undefined, ms = 0) {
  const result = typeof fn === 'function' ? fn() : undefined;
  await delay(ms);
  return result;
}
