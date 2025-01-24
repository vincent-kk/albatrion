import { delay } from './delay';

/**
 * @description fn을 실행시키고, 일정 시간을 대기한 후, fn의 반환값을 반환하는 함수
 * @param {Fn<[], T>} fn - 실행할 함수
 * @param {number} ms - 지연 시간
 * @returns {Promise<T>} fn의 반환값
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
