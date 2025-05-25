import type { AsyncFn } from '@aileron/declare';

import type { DelayOptions } from './delay';
import { timeout } from './timeout';

/**
 * @description Function that sets a timeout, causing an error if fn does not complete within a certain time
 * @param {AsyncFn<[], T>} fn - Function to execute
 * @param {number} ms - Delay time
 * @param {DelayOptions} options - Options
 * @param {AbortSignal} options.signal - Signal to abort the promise before it completes
 * @returns {Promise<T>} Returns the result if fn completes within ms, throws TimeoutError if it exceeds ms
 */
export const withTimeout = <T>(
  fn: AsyncFn<[], T>,
  ms: number,
  options?: DelayOptions,
): Promise<T> => {
  return Promise.race([fn(), timeout(ms, options)]);
};
