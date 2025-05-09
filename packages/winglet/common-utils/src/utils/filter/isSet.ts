/**
 * 값이 Set 객체인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 Set 객체이면 true, 아니면 false
 */
export const isSet = <T extends Set<any>>(value: unknown): value is T =>
  value instanceof Set;
