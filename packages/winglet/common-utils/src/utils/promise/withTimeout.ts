import type { AsyncFn } from '@aileron/declare';

import type { DelayOptions } from './delay';
import { timeout } from './timeout';

/**
 * @description fn이 일정 시간 이내에 완료되지 않으면 오류를 발생시키는 것으로, timeout을 설정하는 함수
 * @param {AsyncFn<[], T>} fn - 실행할 함수
 * @param {number} ms - 지연 시간
 * @param {DelayOptions} options - 옵션
 * @param {AbortSignal} options.signal - promise가 종료되기 전에 abort 시키는 signal
 * @returns {Promise<T>} ms 이내에 fn이 반환되면 결과를 반환하고, ms를 초과하면 TimeoutError를 발생
 */
export const withTimeout = <T>(
  fn: AsyncFn<[], T>,
  ms: number,
  options?: DelayOptions,
): Promise<T> => {
  return Promise.race([fn(), timeout(ms, options)]);
};
