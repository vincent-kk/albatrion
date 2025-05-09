import { isPlainObject } from './isPlainObject';

/**
 * 값이 비어있는 일반 객체인지 확인하는 함수
 * 일반 객체이면서 속성이 없으면 비어있는 일반 객체로 간주
 * @param value - 확인할 값
 * @returns 값이 비어있는 일반 객체이면 true, 아니면 false
 */
export const isEmptyPlainObject = (value: unknown): value is object => {
  if (!isPlainObject(value)) return false;
  for (const _ in value) return false;
  return true;
};
