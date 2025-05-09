/**
 * 값이 배열과 유사한 구조를 가지는지 확인하는 함수
 * 배열처럼 동작하는 객체(길이가 있고 인덱스로 접근 가능한 객체)인지 확인
 * @param value - 확인할 값
 * @returns 값이 배열과 유사한 구조라면 true, 아니면 false
 */
export const isArrayLike = (value: unknown): value is ArrayLike<unknown> =>
  value !== null &&
  typeof value === 'object' &&
  'length' in value &&
  typeof value.length === 'number' &&
  (value.length === 0 || value.length - 1 in value);
