/**
 * 값이 WeakMap 객체인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 WeakMap 객체이면 true, 아니면 false
 */
export const isWeakMap = <T extends WeakMap<any, any>>(
  value: unknown,
): value is T => value instanceof WeakMap;
