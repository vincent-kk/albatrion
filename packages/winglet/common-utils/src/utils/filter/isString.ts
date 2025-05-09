/**
 * 값이 문자열인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 문자열이면 true, 아니면 false
 */
export const isString = (value?: unknown): value is string =>
  typeof value === 'string';
