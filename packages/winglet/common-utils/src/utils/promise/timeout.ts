import { TimeoutError } from '@/common-utils/errors/TimeoutError';
import { type DelayOptions, delay } from '@/common-utils/utils/promise/delay';

/**
 * @description Function that waits for a certain amount of time and then throws a TimeoutError
 * @param {number} ms - Delay time
 * @param {DelayOptions} options - Options
 * @param {AbortSignal} options.signal - Signal to abort the promise before it completes
 * @returns {Promise<never>} Promise that throws an exception after delay
 */
export const timeout = async (
  ms?: number,
  options?: DelayOptions,
): Promise<never> => {
  await delay(ms, options);
  throw new TimeoutError('AFTER_DELAY', `Timeout after ${ms}ms`, { delay: ms });
};
