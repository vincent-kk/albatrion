/**
 * 값이 불리언 타입인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 불리언이면 true, 아니면 false
 */
export const isBoolean = (value?: unknown): value is boolean =>
  typeof value === 'boolean';
