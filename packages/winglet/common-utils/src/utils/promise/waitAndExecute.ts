import type { Fn } from '@aileron/declare';

import { delay } from './delay';

/**
 * @description 일정 시간 이후 fn을 실행시키고, 그 결과를 반환하는 함수
 * @param {Fn<[], T>} fn - 실행할 함수
 * @param {number} ms - 지연 시간
 * @returns {Promise<T>} fn의 반환값
 */
export async function waitAndExecute<T>(fn: Fn<[], T>, ms?: number): Promise<T>;
export async function waitAndExecute(
  fn: undefined,
  ms?: number,
): Promise<undefined>;

export async function waitAndExecute<T>(fn: Fn<[], T> | undefined, ms = 0) {
  await delay(ms);
  return typeof fn === 'function' ? fn() : undefined;
}
