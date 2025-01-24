import { TimeoutError } from '../../errors';
import { type DelayOptions, delay } from './delay';

export const timeout = async (
  ms?: number,
  options?: DelayOptions,
): Promise<never> => {
  await delay(ms, options);
  throw new TimeoutError('AFTER_DELAY', `Timeout after ${ms}ms`, { delay: ms });
};
