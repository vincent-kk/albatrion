/**
 * 값이 정규식인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 정규식이면 true, 아니면 false
 */
export const isRegex = (value: unknown): value is RegExp =>
  value instanceof RegExp;
