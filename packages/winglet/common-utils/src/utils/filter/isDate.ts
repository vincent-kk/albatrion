/**
 * 값이 Date 객체인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 Date 객체이면 true, 아니면 false
 */
export const isDate = (value: unknown): value is Date => value instanceof Date;
