import { AbortError } from '@/common-utils/errors/AbortError';

export interface DelayOptions {
  signal?: AbortSignal;
}

/**
 * @description Function that creates a Promise that resolves after a certain amount of time
 * @param {number} ms - Delay time
 * @param {DelayOptions} options - Options
 * @param {AbortSignal} options.signal - Signal to abort the promise before it completes
 * @returns {Promise<void>} Promise that resolves after delay, void 0
 */
export const delay = (ms?: number, options?: DelayOptions): Promise<void> =>
  new Promise((resolve, reject) => {
    const signal = options?.signal;

    if (signal?.aborted) {
      return reject(
        new AbortError('SIGNAL_RECEIVED_BEFORE_RUN', 'Aborted before run'),
      );
    }

    const handleAbort = () => {
      clearTimeout(timeoutId);
      reject(new AbortError('SIGNAL_RECEIVED', 'Abort signal received'));
    };

    signal?.addEventListener('abort', handleAbort, { once: true });

    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort);
      resolve();
    }, ms);
  });
