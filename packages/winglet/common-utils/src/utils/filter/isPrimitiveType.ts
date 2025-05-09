/**
 * 값이 원시 타입인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 원시 타입이면 true, 아니면 false
 */
export const isPrimitiveType = (value: unknown): value is PrimitiveType =>
  value == null || (typeof value !== 'object' && typeof value !== 'function');

export type PrimitiveType =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;
