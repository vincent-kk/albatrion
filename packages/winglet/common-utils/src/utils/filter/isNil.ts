/**
 * 값이 null 또는 undefined인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 null 또는 undefined이면 true, 아니면 false
 */
export const isNil = (value?: unknown): value is null | undefined =>
  value == null;
