import { TimeoutError } from '../../errors';
import { type DelayOptions, delay } from './delay';

/**
 * @description 일정 시간을 기다린 후, TimeoutError를 발생시키는 함수
 * @param {number} ms - 지연 시간
 * @param {DelayOptions} options - 옵션
 * @param {AbortSignal} options.signal - promise가 종료되기 전에 abort 시키는 signal
 * @returns {Promise<never>} 지연 후 예외를 발생시키는 Promise
 */
export const timeout = async (
  ms?: number,
  options?: DelayOptions,
): Promise<never> => {
  await delay(ms, options);
  throw new TimeoutError('AFTER_DELAY', `Timeout after ${ms}ms`, { delay: ms });
};
