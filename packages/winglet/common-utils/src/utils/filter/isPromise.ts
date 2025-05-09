/**
 * 값이 Promise인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 Promise이면 true, 아니면 false
 */
export const isPromise = <T extends Promise<any>>(value: unknown): value is T =>
  value instanceof Promise;
