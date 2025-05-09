/**
 * 값이 null 또는 undefined이지 않은지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 null 또는 undefined이지 않으면 true, 아니면 false
 */
export const isNotNil = <T>(value: T | null | undefined): value is T =>
  value != null;
