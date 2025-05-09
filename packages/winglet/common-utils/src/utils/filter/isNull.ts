/**
 * 값이 null인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 null이면 true, 아니면 false
 */
export const isNull = (value?: unknown): value is null => value === null;
