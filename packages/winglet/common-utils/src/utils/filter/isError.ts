/**
 * 값이 Error 객체인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 Error 객체이면 true, 아니면 false
 */
export const isError = (value: unknown): value is Error =>
  value instanceof Error;
