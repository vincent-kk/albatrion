import { AbortError } from '../../errors';

export interface DelayOptions {
  signal?: AbortSignal;
}

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
