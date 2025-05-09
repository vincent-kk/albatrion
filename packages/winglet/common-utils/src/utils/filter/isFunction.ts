import type { Fn } from '@aileron/declare';

/**
 * 값이 함수인지 확인하는 함수
 * @template T - 함수 타입
 * @param value - 확인할 값
 * @returns 값이 함수이면 true, 아니면 false
 */
export const isFunction = <T extends Fn<any[], any>>(
  value: unknown,
): value is T => typeof value === 'function';
