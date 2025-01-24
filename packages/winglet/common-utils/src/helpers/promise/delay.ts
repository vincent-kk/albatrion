import { AbortError } from '../../errors';

export interface DelayOptions {
  signal?: AbortSignal;
}

/**
 * @description 일정 시간 이후 반환되는 Promise를 생성하는 함수
 * @param {number} ms - 지연 시간
 * @param {DelayOptions} options - 옵션
 * @param {AbortSignal} options.signal - promise가 종료되기 전에 abort 시키는 signal
 * @returns {Promise<void>} 지연 후 반환되는 Promise, void 0
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
