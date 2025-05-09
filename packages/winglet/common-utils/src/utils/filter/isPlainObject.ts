/**
 * 값이 순수 데이터 객체인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 순수 데이터 객체이면 true, 아니면 false
 */
export const isPlainObject = <T extends Record<PropertyKey, any>>(
  value: unknown,
): value is T => {
  if (!value || typeof value !== 'object') return false;

  const proto = Object.getPrototypeOf(value) as typeof Object.prototype | null;
  const hasObjectPrototype =
    proto === null ||
    proto === Object.prototype ||
    Object.getPrototypeOf(proto) === null;
  if (!hasObjectPrototype) return false;

  return Object.prototype.toString.call(value) === '[object Object]';
};
