import type { AsyncFn } from '@aileron/types';

import type { DelayOptions } from './delay';
import { timeout } from './timeout';

export const withTimeout = <T>(
  fn: AsyncFn<[], T>,
  ms: number,
  options?: DelayOptions,
): Promise<T> => {
  return Promise.race([fn(), timeout(ms, options)]);
};
